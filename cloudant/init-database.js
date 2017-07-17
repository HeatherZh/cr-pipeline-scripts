/* jshint node:true */
/** ******************************************************** {COPYRIGHT-TOP} ****
* Licensed Materials - Property of IBM
*
* (C) Copyright IBM Corp. 2016 All Rights Reserved
*
* US Government Users Restricted Rights - Use, duplication, or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
********************************************************* {COPYRIGHT-END} ****/

/*
 This script will read design documents from a directory and update them in a Cloudant database using couchmigrate.
 See https://github.com/glynnbird/couchmigrate for more info on couchmigrate
 */
var colors = require('colors/safe')
var dbUtil = require('./db-util')

var url = process.env.CLOUDANT_INIT_URL || process.env.CLOUDANT_URL
var databaseName = process.env.CLOUDANT_DB
const designDir = process.env.DESIGN_DIR

if (!url || !databaseName || !designDir) {
  console.error('CLOUDANT_INIT_URL or CLOUDANT_URL, CLOUDANT_DB and DESIGN_DIR are required environment variables.')
  process.exit(1)
}

console.log('Cloudant database target is %s', databaseName)

dbUtil.checkIfDatabaseExists(url, databaseName, function (existsCheckError, databaseExists) {
  if (existsCheckError) {
    console.error('Error checking if %s database exists', databaseName)
    console.error(existsCheckError.message)
    process.exit(1)
  } else if (!databaseExists) {
    console.log('Database %s does not exist. Creating database...', databaseName)
    dbUtil.createDatabase(url, databaseName, function (createError) {
      if (createError) {
        console.error('Database %s creation failed', databaseName)
        console.error(createError.message)
        process.exit(1)
      } else {
        console.log('Database %s created', databaseName)
        dbUtil.updateDesignDocs(url, databaseName, `${designDir}/view`, function () {
          dbUtil.updateQueryIndexes(url, databaseName, `${designDir}/query`, function () {
            console.log(colors.green('\nDatabase Upgrade Complete'))
          })
        })
      }
    })
  } else {
    console.log('Database %s exists', databaseName)
    dbUtil.updateDesignDocs(url, databaseName, `${designDir}/view`, function () {
      dbUtil.updateQueryIndexes(url, databaseName, `${designDir}/query`, function () {
        console.log(colors.green('\nDatabase Upgrade Complete'))
      })
    })
  }
})
