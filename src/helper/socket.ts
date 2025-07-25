import { Server } from "socket.io"
import { chatModel } from "../database"

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" }
  })

  io.on("connection", (socket) => {
    console.log("User connected", socket.id)

    socket.on("join", (userId) => {
      socket.join(userId)
    })

    socket.on("send_message", async (data) => {
      const { senderId, receiverId, message } = data

      const newChat = await chatModel.create({ senderId, receiverId, message })

      io.to(receiverId).emit("receive_message", newChat)
    })

    socket.on("2222", () => { 
      console.log("User disconnected", socket.id)
    })
  })
}
