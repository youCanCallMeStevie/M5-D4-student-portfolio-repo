
//IMPORTS
const express = require("express")
const cors = require("cors")
const listEndpoints = require("express-list-endpoints")
const studentRoutes = require("./services/students") 
const projectsRouter = require("./services/projects")
// const problematicRoutes = require("./services/problematicRoutes")
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
} = require("./errorHandling")

const server = express()

const port = process.env.PORT 

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
  next()
}
//Middlewares

server.use(cors())
server.use(express.json())
server.use(loggerMiddleware)

server.use("/projects", projectsRouter)
server.use("/students", studentRoutes)
// server.use("/problems", problematicRoutes)

// ERROR HANDLERS

server.use(notFoundHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.log(listEndpoints(server))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
