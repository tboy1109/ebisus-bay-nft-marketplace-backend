#!/bin/sh
set -x #trace on
set -e #break on error

# Be informative after successful login.
echo -e "\n\nApp container image built on $(date)." > /etc/motd

# Remove existing crontabs, if any.
rm -fr /var/spool/cron && rm -fr /etc/crontabs && rm -fr /etc/periodic

# Remove all but a handful of admin commands.
find /sbin /usr/sbin ! -type d -a ! -name nologin -delete

# Remove world-writeable permissions except for /tmp
find / -xdev -type d -perm /0002 -exec chmod o-w {} + \
  && find / -xdev -type f -perm /0002 -exec chmod o-w {} + \
  && chmod 777 /tmp \
  && chown node:root /tmp

# Remove unnecessary accounts, excluding current app user and root
sed -i -r '/^(node|root|nobody)/!d' /etc/group \
  && sed -i -r '/^(node|root|nobody)/!d' /etc/passwd

# Remove interactive login shell for everybody
sed -i -r 's#^(.*):[^:]*$#\1:/sbin/nologin#' /etc/passwd

# Disable password login for everybody
while IFS=: read -r username _; do passwd -l "$username"; done < /etc/passwd || true

# Remove temp shadow,passwd,group
find /bin /etc /lib /sbin /usr -xdev -type f -regex '.*-$' -exec rm -f {} +

# Ensure system dirs are owned by root and not writable by anybody else.
find /bin /etc /lib /sbin /usr -xdev -type d \
  -exec chown root:root {} \; \
  -exec chmod 0755 {} \;

# Remove suid & sgid files
find /bin /etc /lib /sbin /usr -xdev -type f -a \( -perm /4000 -o -perm /2000 \) -delete

# Remove dangerous commands
find /bin /etc /lib /sbin /usr -xdev \( \
  -name hexdump -o \
  -name chgrp -o \
  -name chmod -o \
  -name chown -o \
  -name ln -o \
  -name od -o \
  -name su \
  -name sudo \
  \) -delete

# Remove init scripts since we do not use them.
rm -fr /etc/init.d /lib/rc /etc/conf.d /etc/inittab /etc/runlevels /etc/rc.conf /etc/logrotate.d

# Remove kernel tunables
rm -fr /etc/sysctl* /etc/modprobe.d /etc/modules /etc/mdev.conf /etc/acpi

# Remove root home dir
rm -fr /root

# Remove fstab
rm -f /etc/fstab

# Remove any symlinks that we broke during previous steps
find /bin /etc /lib /sbin /usr -xdev -type l -exec test ! -e {} \; -delete
