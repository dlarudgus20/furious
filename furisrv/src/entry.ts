#!/usr/bin/env node

import { CONFIG } from './config'
import { app } from './app'
import { initializeDatabase } from './db'
import { logger } from './logger'

const port = CONFIG.PORT

async function main() {
  await initializeDatabase()

  app.listen(port, () => {
    logger.info(`listening on :${port}`)
  })
}

main()
