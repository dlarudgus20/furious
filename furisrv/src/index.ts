import { app } from './app'
import { initializeDatabase } from './db'

const port = 8080

async function main() {
  await initializeDatabase()

  app.listen(port, () => {
    console.log(`listening on :${port}`)
  })
}

main()
