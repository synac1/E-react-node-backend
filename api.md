ws://localhost:8080/api/chat/sendMessage(method:ws)
PARAMS
{"message":"123",
"sender":"1",
"receiver":"1",
"senderIdentity":"doctor",
"receiverIdentity":"patient"}

RES
{"chatMessage": {
"message": "123",
"timestamp": "2023-10-25 23:22:55",
"sender": "2",
"receiver": "2",
"senderIdentity": "doctor",
"receiverIdentity": "patient"
},
"conversationId": "6058803e-7746-490d-adc8-4bb8be69eaa3"}

http://localhost:8080/api/chat/getConversationIdByUserIdentity?sender=1&senderIdentity=doctor&receiver=1&receiverIdentity=patient(method:httpget)
