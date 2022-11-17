import shell from "shelljs"

shell.config.silent = false

shell.mkdir('-p', './dist/views')
shell.cp( "-R", "./src/views/*", "./dist/views" )