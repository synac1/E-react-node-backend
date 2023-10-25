const express = require("express");
const expressWs = require('express-ws');
const router = express.Router();
const mysql = require("../models/dbConnection");
const uuid = require("uuid");
const { json } = require("sequelize");
const WebSocket = require('ws');
expressWs(router);

const connections = new Set();
router.ws('/sendMessage',(ws,req)=>{
    ws.on('message',async(message)=>{
        connections.add(ws);
        const parsedMessage = JSON.parse(message);
        //identity refers to sender identity
        const chatMessage = {
            message: parsedMessage.message,
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            sender: parsedMessage.sender,
            receiver: parsedMessage.receiver,
            senderIdentity: parsedMessage.senderIdentity,
            receiverIdentity: parsedMessage.receiverIdentity,
          };
        console.log(chatMessage);
          let sql1 = `SELECT conversation_id FROM chat_table WHERE sender = ${chatMessage.receiver} and sender_identity = '${chatMessage.receiverIdentity}' `;
          let sql2 = `SELECT conversation_id FROM chat_table WHERE sender = ${chatMessage.sender} and sender_identity = '${chatMessage.senderIdentity}' `;
          try {
            let result1 = await mysql.query(sql1);
            let result2 = await mysql.query(sql2);
            if(result1.length==0&&result2.length==0){
                const conversationId = uuid.v4();
                let sql = `INSERT into chat_table (conversation_id, sender, receiver, sender_identity, receiver_identity, time, message) VALUES ('${conversationId}', ${chatMessage.sender}, ${chatMessage.receiver},'${chatMessage.senderIdentity}', '${chatMessage.receiverIdentity}', '${chatMessage.timestamp}', '${chatMessage.message}');`;
                let result3 = mysql.query(sql);
                console.log(result3);
            }
          } catch (error) {
            console.log(error,"Something wrong in MySQL." );
            res.send({ error: "Something wrong in MySQL." });
            return;
          }
          connections.forEach((client) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(chatMessage));
            }
            
          });
          
    });
});


module.exports = router;