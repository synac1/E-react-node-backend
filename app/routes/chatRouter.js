const express = require("express");
const expressWs = require('express-ws');
const router = express.Router();
const mysql = require("../models/dbConnection");
const uuid = require("uuid");
const { json } = require("sequelize");
const WebSocket = require('ws');

expressWs(router);

let num = 0;
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

router.get("/getDoctorChatList",async(req,res)=>{
  const doctorId = req.query.doctorId;
  try{
    let sql = `SELECT * FROM doctor_recordauthorized  WHERE doctor_id = ${doctorId}`;
    let result = await mysql.query(sql);
    let patientIdArr = result.map((item,index)=>{
      
      return item.patient_id;
    });
    console.log(patientIdArr);
    let sql2 = `SELECT * FROM patients_registration  WHERE id in (${patientIdArr.join(', ')})`;
    let result2 = await mysql.query(sql2);
    res.json(result2);
  }catch(error){
    console.log(error,"Something wrong in MySQL.");
    res.send("server is busy");
    return;
  }
});

router.get("/getPatientChatList",async(req,res)=>{
  const patientId = req.query.patientId;
  try{
    let sql = `SELECT * FROM doctor_recordauthorized  WHERE patient_id = ${patientId}`;
    let result = await mysql.query(sql);
    let doctorIdArr = result.map((item,index)=>{
      
      return item.doctor_id;
    });
    let sql2 = `SELECT * FROM doctors_registration  WHERE id in (${doctorIdArr.join(', ')})`;
    let result2 = await mysql.query(sql2);
    res.json(result2);
  }catch(error){
    console.log(error,"Something wrong in MySQL.");
    res.send("server is busy");
    return;
  }
});

router.get("/getCurrentId",async(req,res)=>{
  console.log(num);
  let identity = null;
  if (num % 2 === 0) {
    identity  = 'doctor';
} else {
    identity = 'patient';
}
  num = num+1;
  let info = null;
  if(identity == 'doctor'){
    let sql = `SELECT * FROM doctors_registration  WHERE id=58`
    info = await mysql.query(sql);
  }else{
    let sql = `SELECT * FROM patients_registration  WHERE id=25`
    info = await mysql.query(sql);
  }
  res.json({
    identity:identity,
    info:info[0]
  });
});





module.exports = router;