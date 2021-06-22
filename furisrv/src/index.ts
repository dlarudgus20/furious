import { app } from './app'
import { initializeDatabase } from './db'
import { logger } from './logger'

const port = 8080

async function main() {
  await initializeDatabase()

  app.listen(port, () => {
    logger.info(`listening on :${port}`)
  })
}

main()
