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
        let sql3 = null;
        let conversationId = null;
        let name = null;
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
          let sql1 = `SELECT conversation_id FROM chat_table WHERE sender = ${chatMessage.receiver} and sender_identity = '${chatMessage.receiverIdentity}' LIMIT 1 `;
          let sql2 = `SELECT conversation_id FROM chat_table WHERE sender = ${chatMessage.sender} and sender_identity = '${chatMessage.senderIdentity}' LIMIT 1 `;
          if(senderIdentity='patient'){
             sql3 = `SELECT FName,MName,LName FROM patients_registration WHERE id = ${chatMessage.sender} `;
          }else{
             sql3 = `SELECT FName,MName,LName FROM doctor_registration WHERE id = ${chatMessage.sender} `;
          }
          try {
            let result1 = await mysql.query(sql1);
            let result2 = await mysql.query(sql2);
            if(result1.length==0&&result2.length==0){
                conversationId = uuid.v4();
                let sql = `INSERT into chat_table (conversation_id, sender, receiver, sender_identity, receiver_identity, time, message) VALUES ('${conversationId}', ${chatMessage.sender}, ${chatMessage.receiver},'${chatMessage.senderIdentity}', '${chatMessage.receiverIdentity}', '${chatMessage.timestamp}', '${chatMessage.message}');`;
                mysql.query(sql);
            }else{
              let res = result1.length==0? result2:result1;
              conversationId = res[0].conversation_id;
              let sql = `INSERT into chat_table (conversation_id, sender, receiver, sender_identity, receiver_identity, time, message) VALUES ('${conversationId}', ${chatMessage.sender}, ${chatMessage.receiver},'${chatMessage.senderIdentity}', '${chatMessage.receiverIdentity}', '${chatMessage.timestamp}', '${chatMessage.message}');`;
              await mysql.query(sql);
            }
            let result3 = await mysql.query(sql3);
            name = result3[0].FName+result3[0].MName+result3[0].LName;
            
          } catch (error) {
            console.log(error,"Something wrong in MySQL." );
            connections.forEach((client) => {
              if (client.readyState === 1) {
                client.send("Server is busy");
              }
            });
            return;
          }
          connections.forEach((client) => {
            if (client.readyState === 1) {
              let chatInfo = {
                chatMessage:chatMessage,
                conversationId:conversationId,
                name:name
              }
              client.send(JSON.stringify(chatInfo));
            }
            
          });
          
    });
});



router.get("/getConversationIdByUserIdentity",async(req,res)=>{
  const sender = req.query.sender;
  const senderIdentity = req.query.senderIdentity;
  const receiver = req.query.receiver;
  const receiverIdentity = req.query.receiverIdentity;
  console.log(sender);
  let sql = `SELECT conversation_id FROM chat_table WHERE sender = ${sender} and sender_identity = '${senderIdentity}' and receiver =${receiver} and receiver_identity='${receiverIdentity}' LIMIT 1 `;
  console.log(sql);
  try{
    let result = await mysql.query(sql);
    console.log(result);
    if(result.length!=0){
      res.json(result[0]);
    }else{
      res.send('no such conversation');
    }
  }catch(error){
    console.log(error,"Something wrong in MySQL.");
    res.send("server is busy");
    return;
  }

});

router.get("/getChatHistoryByConversationId",async(req,res)=>{
  const conversationId = req.query.conversationId;
  console.log(conversationId);
  let sql = `SELECT * FROM chat_table WHERE conversation_id = '${conversationId}'`;
  try{
    let result = await mysql.query(sql);
    if(result.length!=0){
      res.json(result);
    }else{
      res.send('no such conversation');
    }
  }catch(error){
    console.log(error,"Something wrong in MySQL.");
    res.send("server is busy");
    return;
  }

});

router.get("/getChatList",async(req,res)=>{
  const userId = req.query.userId;
  const userIdentity = req.query.userIdentity;
  let sql1 = `SELECT * FROM chat_table WHERE sender = ${userId} and sender_identity = '${userIdentity}'`;
  let sql2 = `SELECT * FROM chat_table WHERE receiver = ${userId} and receiver_identity = '${userIdentity}'`;
  try{
    let result1 = await mysql.query(sql1);
    console.log(result1);
    let result2 = await mysql.query(sql2);
    let set = new Set();
    let res = result1.filter(function(item){
      if(set.has(item.sender_identity+item.sender.toString())){
        return false;
      }else{
        set.add(item.sender_identity+item.sender.toString());
        return true;
      }
    });
    console.log(set);
    console.log(res);

  }catch(error){
    console.log(error,"Something wrong in MySQL.");
    res.send("server is busy");
    return;
  }
})






module.exports = router;