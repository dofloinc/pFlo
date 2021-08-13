#!/bin/bash

rm -rf /root/.ssh

mkdir /root/.ssh/
 
echo "$RSA" >> /root/.ssh/id_ed25519

chown 0600 /root/.ssh/id_ed25519

ssh-keygen -y -f /root/.ssh/id_ed25519 > /root/.ssh/id_ed25519.pub

(host=github.com; ssh-keyscan -H $host; for ip in $(dig @8.8.8.8 github.com +short); do ssh-keyscan -H $host,$ip; ssh-keyscan -H $ip; done) 2> /dev/null >> /root/.ssh/known_hosts

exit 0
