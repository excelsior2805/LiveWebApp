const webSocket = new WebSocket("ws://192.168.0.103:3000")
webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch(data.type){
        case "offer":
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

function createAndSendAnswer(){
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    },error => {
        console.log(error)
    })
}
function sendData(data){
    data.username = username
    webSocket.send(JSON.stringify(data))
}

let localStream
let peerConn
let username;
function joinCall(){
    username = document.getElementById("username-input").value
    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width:{
                min: 480, ideal: 720, max:1280
            },
            aspectRatio: 1.3333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream;
        let configuration = {
            iceServers: [
                {
                    "urls": ["stun.l.google.com:19302",
                             "stun1.l.google.com:19302",
                             "stun2.l.google.com:19302"]
                },

            ]
        }
        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)
        peerConn.onAddStream = (e) =>{
            document.getElementById("remote-video")
            .srcObject = e.stream
        }
        peerConn.onicecandidate = ((e) => {
            if(e.candidate == null)
                return
            sendData({
                type: "send_candidate",
                candidate: e.candidate
            })
        })
        sendData({
            type: "join-call"
        })
    }, (error) => {
        console.log(error)
    })
}


let isAudio = true
function muteAudio(){
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enable = isAudio
}

let isVideo = true
function muteVideo(){
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enable = isVideo
}