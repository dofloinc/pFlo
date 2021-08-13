PageFlo may override (wrap) native DOM functions for monitoring purposes, depending
on the plugins and features that are enabled.

Generally, PageFlo wraps these functions to add a small amount of custom instrumentation,
prior to executing the original function.

The following is a list of known DOM overrides:

| Method                       | Plugin                        | Option                                        | Purpose                                                            |
|:-----------------------------|:------------------------------|:----------------------------------------------|:-------------------------------------------------------------------|
| `XMLHttpRequest` constructor | {@link PFLO.plugins.AutoXHR} | `instrument_xhr`                              | Monitor timing for XHRs (individual and during SPA navigations)    |
| `fetch`                      | {@link PFLO.plugins.AutoXHR} | `AutoXHR.monitorFetch`                        | Monitor timing for fetches (individual and during SPA navigations) |
| `window.onerror`             | {@link PFLO.plugins.Errors}  | `Errors.monitorGlobal`                        | Monitor global exceptions                                          |
| `console.error`              | {@link PFLO.plugins.Errors}  | `Errors.monitorConsole`                       | Monitor app-generated error messages                               |
| `addEventListener`           | {@link PFLO.plugins.Errors}  | `Errors.monitorEvents`                        | Wrapped so messages from cross-origin frames have a full stack     |
| `removeEventListener`        | {@link PFLO.plugins.Errors}  | `Errors.monitorEvents`                        | Wrapped so messages from cross-origin frames have a full stack     |
| `setTimeout`                 | {@link PFLO.plugins.Errors}  | `Errors.monitorTimeout`                       | Wrapped so messages from cross-origin frames have a full stack     |
| `setInterval`                | {@link PFLO.plugins.Errors}  | `Errors.monitorTimeout`                       | Wrapped so messages from cross-origin frames have a full stack     |
| `history.back`               | {@link PFLO.plugins.History} | When {@link PFLO.plugins.History} is enabled | SPA Soft Navigation monitoring                                     |
| `history.forward`            | {@link PFLO.plugins.History} | When {@link PFLO.plugins.History} is enabled | SPA Soft Navigation monitoring                                     |
| `history.pushState`          | {@link PFLO.plugins.History} | When {@link PFLO.plugins.History} is enabled | SPA Soft Navigation monitoring                                     |
| `history.replaceState`       | {@link PFLO.plugins.History} | When {@link PFLO.plugins.History} is enabled | SPA Soft Navigation monitoring                                     |
| `history.go`                 | {@link PFLO.plugins.History} | When {@link PFLO.plugins.History} is enabled | SPA Soft Navigation monitoring                                     |
