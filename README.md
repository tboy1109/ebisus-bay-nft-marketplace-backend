# EbisusBay API

## Run docker images locally
Note: Instructions only for MacOS.

```
cd /<pathtorepository>/eb_ts_api
```

### Build and run
```
docker-compose -f docker-compose.yml up --build --remove-orphans
```

Note: At this point you'll need to import initial database to get everything working!

Install MySQL Client:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor
brew update
brew install mysql-client
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
% mysql -V
mysql  Ver 8.0.28 for macos12.0 on x86_64 (Homebrew)
```

Import initial data:

Create user:
```
mysql -h 127.0.0.1 -P 3306 -u root -pr00t123
ALTER USER 'ebmarketplaceuser'@'%' IDENTIFIED WITH mysql_native_password BY 'verysecret';
FLUSH PRIVILEGES;
quit
```

Import data:
```
mysql -h 127.0.0.1 -P 3306 -u ebmarketplaceuser -pverysecret marketplace < ./initial_db_data/marketplace_only_tables.sql
```

Stop environment:
```
CTRL + C
```

Start environment again:
```
docker-compose -f docker-compose.yml up --build --remove-orphans
```

Verify stack:
```
% docker ps
CONTAINER ID   IMAGE                             COMMAND                  CREATED          STATUS                    PORTS                               NAMES
ed3e7dc480df   eb_ts_api_ebisusbay-admin-nginx   "/entrypoint.sh"         28 seconds ago   Up 24 seconds (healthy)   80/tcp, 0.0.0.0:8888->8888/tcp      ebisusbay-admin-nginx
4b8169fa8759   eb_ts_api_ebisusbay-admin         "docker-entrypoint.s…"   28 seconds ago   Up 25 seconds (healthy)   0.0.0.0:3333->3333/tcp              ebisusbay-admin
3e44561c97d9   eb_ts_api_ebisusbay-api-nginx     "/entrypoint.sh"         28 seconds ago   Up 25 seconds (healthy)   80/tcp, 0.0.0.0:8080->8080/tcp      ebisusbay-api-nginx
415c2cdf84e8   eb_ts_api_ebisusbay-api           "docker-entrypoint.s…"   28 seconds ago   Up 26 seconds (healthy)   0.0.0.0:3030->3030/tcp              ebisusbay-api
243450fe6ae8   mysql:8                           "docker-entrypoint.s…"   6 minutes ago    Up 27 seconds (healthy)   0.0.0.0:3306->3306/tcp, 33060/tcp   ebisusbay-db
```

Delete stack:
```
docker-compose down
```

Logs:
```
tail -f ./volumes/ebisusbay-api_logs/nodejs.log
tail -f ./volumes/ebisusbay-admin_logs/nodejs.log
```

Connect to individual container via "SSH":
```
docker exec -it ebisusbay-api-nginx /bin/bash
docker exec -it ebisusbay-api /bin/bash
docker exec -it ebisusbay-admin-nginx /bin/bash
docker exec -it ebisusbay-admin /bin/bash
docker exec -it ebisusbay-db /bin/bash
```

Useful commands:
Delete:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache
```
docker system prune
```

Delete:
  - Same as above + all volumes not used by at least one container
```
docker system prune --volumes
```

## AWS RDS Databases

### SANDBOX
#### Connecting to database (via SSH tunnel)
```
ssh-add ssh-add ~/.ssh/ebisusbay-aws.pem
ssh -L localhost:13306:dev-ebisusbay-marketplace.cluster-cfrx0sgl03rs.us-east-1.rds.amazonaws.com:3306 ec2-user@3.218.132.72
```
#### Test connection
```
% nc -v localhost 13306
Connection to localhost port 13306 [tcp/*] succeeded!
8.0.23
```
#### Creating service users

##### Install MySQL Client
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor
brew update
brew install mysql-client
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
% mysql -V
mysql  Ver 8.0.28 for macos12.0 on x86_64 (Homebrew)
```
##### Connect to MySQL
```
mysql -u admin -p -h 127.0.0.1 -P 13306
```
Enter password: "1Password" -> "Operations" -> "EbisusBay Marketplace DB - DEV (Admin User)"

##### Create database & service user
```
CREATE DATABASE marketplace_sandbox;

CREATE USER 'ebmarketplaceuser_sandbox'@'%' IDENTIFIED BY '<1password>';
"1Password" -> "Operations" -> "EbisusBay Marketplace DB - SANDBOX (Service User)"

GRANT ALL PRIVILEGES ON marketplace_sandbox.* TO 'ebmarketplaceuser_sandbox'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SHOW GRANTS for ebmarketplaceuser_sandbox;

+------------------------------------------------------------------------------------------------------+
| Grants for ebmarketplaceuser_sandbox@%                                                               |
+------------------------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `ebmarketplaceuser_sandbox`@`%`                                                |
| GRANT ALL PRIVILEGES ON `marketplace_sandbox`.* TO `ebmarketplaceuser_sandbox`@`%` WITH GRANT OPTION |
+------------------------------------------------------------------------------------------------------+
```

### TEST
#### Connecting to database (via SSH tunnel)
```
ssh-add ssh-add ~/.ssh/ebisusbay-aws.pem
ssh -L localhost:13306:dev-ebisusbay-marketplace.cluster-cfrx0sgl03rs.us-east-1.rds.amazonaws.com:3306 ec2-user@3.218.132.72
```
#### Test connection
```
% nc -v localhost 13306
Connection to localhost port 13306 [tcp/*] succeeded!
8.0.23
```
#### Creating service users

##### Install MySQL Client
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor
brew update
brew install mysql-client
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
% mysql -V
mysql  Ver 8.0.28 for macos12.0 on x86_64 (Homebrew)
```
##### Connect to MySQL
```
mysql -u admin -p -h 127.0.0.1 -P 13306
```
Enter password: "1Password" -> "Operations" -> "EbisusBay Marketplace DB - DEV (Admin User)"

##### Create database & service user
```
CREATE DATABASE marketplace_test;

CREATE USER 'ebmarketplaceuser_test'@'%' IDENTIFIED BY '<1password>';
"1Password" -> "Operations" -> "EbisusBay Marketplace DB - TEST (Service User)"

GRANT ALL PRIVILEGES ON marketplace_test.* TO 'ebmarketplaceuser_test'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SHOW GRANTS for ebmarketplaceuser_test;

+------------------------------------------------------------------------------------------------+
| Grants for ebmarketplaceuser_test@%                                                            |
+------------------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `ebmarketplaceuser_test`@`%`                                             |
| GRANT ALL PRIVILEGES ON `marketplace_test`.* TO `ebmarketplaceuser_test`@`%` WITH GRANT OPTION |
+------------------------------------------------------------------------------------------------+
```

### DEVELOPMENT
#### Connecting to database (via SSH tunnel)
```
ssh-add ssh-add ~/.ssh/ebisusbay-aws.pem
ssh -L localhost:13306:dev-ebisusbay-marketplace.cluster-cfrx0sgl03rs.us-east-1.rds.amazonaws.com:3306 ec2-user@3.218.132.72
```
#### Test connection
```
% nc -v localhost 13306
Connection to localhost port 13306 [tcp/*] succeeded!
8.0.23
```
#### Creating service users

##### Install MySQL Client
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor
brew update
brew install mysql-client
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
% mysql -V
mysql  Ver 8.0.28 for macos12.0 on x86_64 (Homebrew)
```
##### Connect to MySQL
```
mysql -u admin -p -h 127.0.0.1 -P 13306
```
Enter password: "1Password" -> "Operations" -> "EbisusBay Marketplace DB - DEV (Admin User)"

##### Create database & service user
```
CREATE DATABASE marketplace;

CREATE USER 'ebmarketplaceuser'@'%' IDENTIFIED BY '<1password>';
"1Password" -> "Operations" -> "EbisusBay Marketplace DB - DEV (Service User)"

GRANT ALL PRIVILEGES ON marketplace.* TO 'ebmarketplaceuser'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SHOW GRANTS for ebmarketplaceuser;

+--------------------------------------------------------------------------------------+
| Grants for ebmarketplaceuser@%                                                       |
+--------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `ebmarketplaceuser`@`%`                                        |
| GRANT ALL PRIVILEGES ON `marketplace`.* TO `ebmarketplaceuser`@`%` WITH GRANT OPTION |
+--------------------------------------------------------------------------------------+
```

### PRODUCTION
#### Connecting to database (via SSH tunnel)
```
ssh-add ssh-add ~/.ssh/ebisusbay-aws.pem
ssh -L localhost:23306:prod-ebisusbay-marketplace.cluster-cfrx0sgl03rs.us-east-1.rds.amazonaws.com:3306 ec2-user@3.218.132.72
```
#### Test connection
```
% nc -v localhost 23306
Connection to localhost port 23306 [tcp/*] succeeded!
8.0.23
```
#### Creating service users

##### Install MySQL Client
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew doctor
brew update
brew install mysql-client
echo 'export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
% mysql -V
mysql  Ver 8.0.28 for macos12.0 on x86_64 (Homebrew)
```
##### Connect to MySQL
```
mysql -u admin -p -h 127.0.0.1 -P 23306
```
Enter password: "1Password" -> "Operations" -> "EbisusBay Marketplace DB - PROD (Admin User)"

##### Create database & service user
```
CREATE DATABASE marketplace;

CREATE USER 'ebmarketplaceuser'@'%' IDENTIFIED BY '<1password>';
"1Password" -> "Operations" -> "EbisusBay Marketplace DB - PROD (Service User)"

GRANT ALL PRIVILEGES ON marketplace.* TO 'ebmarketplaceuser'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SHOW GRANTS for ebmarketplaceuser;

+--------------------------------------------------------------------------------------+
| Grants for ebmarketplaceuser@%                                                       |
+--------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `ebmarketplaceuser`@`%`                                        |
| GRANT ALL PRIVILEGES ON `marketplace`.* TO `ebmarketplaceuser`@`%` WITH GRANT OPTION |
+--------------------------------------------------------------------------------------+
```
