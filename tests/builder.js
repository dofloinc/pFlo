/*eslint-env node*/
//
// Imports
//
var grunt = require("grunt");
var fs = require("fs");
var path = require("path");
var async = require("async");

//
// Helper Functions
//
function getFiles(dir, nameMatch, callback) {
	async.waterfall([
		function(cb) {
			fs.readdir(dir, function(err, matches) {
				cb(err, matches);
			});
		},
		function(matches, cb) {
			var files = matches.map(function(match) {
				return path.join(dir, match);
			}).filter(function(match) {
				// Don't run statSync on .#-files as they confuse node
				if (!match.match("\.#")) {
					return fs.statSync(match).isFile() &&
						!match.endsWith(".swp") &&
						!match.endsWith("~") &&
						(nameMatch === "" || match.indexOf(nameMatch) !== -1);
				}
			});

			cb(null, files);
		}
	], callback);
}

function getDirs(dir, callback) {
	async.waterfall([
		function(cb) {
			fs.readdir(dir, function(err, matches) {
				cb(err, matches);
			});
		},
		function(matches, cb) {
			var dirs = matches.map(function(match) {
				return path.join(dir, match);
			}).filter(function(match) {
				return !fs.statSync(match).isFile();
			});

			cb(null, dirs);
		}
	], callback);
}

//
// Exports
//
module.exports = function(gruntTask, testTemplatesDir, testSnippetsDir, testPagesDir, e2eDir, e2eJsonPath) {
	//
	// Inputs
	//
	var testsDir = __dirname;
	testTemplatesDir = testTemplatesDir || path.join(testsDir, "page-templates");
	testSnippetsDir = testSnippetsDir || path.join(testsDir, "page-template-snippets");
	testPagesDir = testPagesDir || path.join(testsDir, "pages");
	e2eDir = e2eDir || path.join(testsDir, "e2e");
	e2eJsonPath = e2eJsonPath || path.join(e2eDir, "e2e.json");

	//
	// Domains for test purposes
	//
	var DEFAULT_TEST_MAIN_DOMAIN = "pflo-test.local";
	var DEFAULT_TEST_SECONDARY_DOMAIN = "pflo-test2.local";

	var pfloE2ETestDomain = grunt.option("main-domain") || DEFAULT_TEST_MAIN_DOMAIN;
	var pfloE2ESecondDomain = grunt.option("secondary-domain") || DEFAULT_TEST_SECONDARY_DOMAIN;
	var pfloE2ETestPort = 4002;

	//make grunt know this task is async.
	var done = gruntTask.async();

	async.waterfall([
		//
		// First, load all static template variables
		//
		function(cb) {
			grunt.log.writeln("Loaded static template variables...");

			var opts = {};

			getFiles(testSnippetsDir, ".tpl", function(err, files) {
				opts.snippetFiles = files;
				cb(err, opts);
			});
		},
		function(opts, cb) {
			opts.vars = {
				mainServer: pfloE2ETestDomain,
				secondaryServer: pfloE2ESecondDomain,
				testPort: pfloE2ETestPort
			};

			// Set all template vars to their file name
			opts.snippetFiles.forEach(function(file) {
				var snippetName = file.replace(testSnippetsDir + path.sep, "").replace(".tpl", "");

				grunt.log.ok(snippetName);

				// load file
				var fileContents = fs.readFileSync(file, "utf-8");

				opts.vars[snippetName] = fileContents;
			});

			cb(null, opts);
		},
		//
		// Find all page-template directories
		//
		function(opts, cb) {
			grunt.log.writeln("Rendering page templates");

			getDirs(testTemplatesDir, function(err, dirs) {
				opts.templateDirs = dirs;
				cb(err, opts);
			});
		},
		function(opts, cb) {
			var rootIndexHtml = "";
			var testDefinitions = [];
			var rootIndexFile = path.join(testPagesDir, "index.html");

			// Set all template vars to their file name
			async.eachSeries(opts.templateDirs, function(dir, cb2) {
				var templateDir = dir.replace(testTemplatesDir + path.sep, "");
				var supportDir = path.join(testTemplatesDir, templateDir, "support");

				rootIndexHtml += "<p><a href='" + templateDir + "/index.html'>" + templateDir + "</a></p>";

				// copy support files over
				if (grunt.file.exists(supportDir)) {
					getFiles(supportDir, "", function(err, files) {
						if (err) {
							return cb2(err);
						}

						var supportDirDest = path.join(testPagesDir, templateDir, "support");

						if (!grunt.file.exists(supportDirDest)) {
							grunt.log.ok(supportDirDest);
							grunt.file.mkdir(supportDirDest);
						}

						files.forEach(function(file) {
							var supportFileBasePath = file.replace(testTemplatesDir + path.sep, "");
							var supportFileName = supportFileBasePath.replace(templateDir + path.sep, "").replace("support" + path.sep, "");

							grunt.log.ok(supportFileBasePath);

							if (supportFileName.endsWith("html")) {
								// read contents
								var contents = fs.readFileSync(file, "utf-8");

								opts.vars.fileName = supportFileName;

								var rendered = grunt.template.process(contents, {
									data: opts.vars
								});

								// write
								grunt.file.write(path.join(supportDirDest, supportFileName), rendered);
							}
							else {
								grunt.file.copy(file, path.join(supportDirDest, supportFileName));
							}
						});
					});
				}

				// get all files for this dir
				getFiles(dir, ".html", function(err, files) {
					if (err) {
						return cb2(err);
					}

					var indexHtml = "";
					var indexFile = path.join(testPagesDir, templateDir, "index.html");
					var indexFileName = path.join(templateDir, "index.html");

					files.forEach(function(file) {
						// template file
						var templateFile = file.replace(testTemplatesDir + path.sep, "");
						var templateFileName = templateFile.replace(templateDir + path.sep, "");
						var templateFileDest = path.join(testPagesDir, templateFile);

						grunt.log.ok(templateFile);


						// javascript file
						var jsFile = file.replace(".html", "") + ".js";
						var jsFileName = jsFile.replace(testTemplatesDir + path.sep, "");
						var jsFileDest = path.join(testPagesDir, jsFileName);

						// read contents
						var contents = fs.readFileSync(file, "utf-8");

						opts.vars.fileName = templateFile;

						var rendered = grunt.template.process(contents, {
							data: opts.vars
						});

						// write
						grunt.file.write(templateFileDest, rendered);

						// skip '.headers' files
						if (!templateFileName.endsWith("html")) {
							return;
						}

						// save to our test definitions
						testDefinitions.push({
							path: templateDir,
							file: templateFileName.replace(".html", "")
						});

						//
						// Index.html
						//
						indexHtml += "<p><a href='" + templateFileName + "'>" + templateFileName + "</a></p>";

						// only show IFRAMEs if there's not a ton of them
						if (files.length <= 5) {
							indexHtml += "<iframe src='" + templateFileName + "' style='width: 100%'></iframe>\n";
						}

						// if the .js file exists, copy that too
						if (grunt.file.exists(jsFile)) {
							grunt.log.ok(jsFileName);

							grunt.file.copy(jsFile, jsFileDest);
						}
					});

					grunt.log.ok(indexFileName);
					grunt.file.write(indexFile, indexHtml);

					cb2();
				});
			}, function(err) {
				// write root index
				grunt.log.ok("index.html");
				grunt.file.write(rootIndexFile, rootIndexHtml);
				var testConfiguration = {
					server: {
						main: pfloE2ETestDomain,
						second: pfloE2ESecondDomain
					},
					ports: {
						main: 4002,
						second: 4003
					},
					tests: testDefinitions
				};
				// test definitions
				grunt.file.write(e2eJsonPath, JSON.stringify(testConfiguration, null, 2));

				cb(err, opts);
			});
		}
	], function(err) {
		if (err) {
			console.log(err);
		}

		done();
	});
};
