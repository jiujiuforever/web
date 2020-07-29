const apienv = {
    dev: {
        auth: "http://localhost:9999/", // 权限系统
        cap: "http://localhost:8090/cap/", //开发环境地址
        // cap: "http://172.16.100.47:35267/cap/",
        // cap: "http://192.169.2.47:8090/cap/", //ding
        // websocket: "ws://172.16.100.60:15674/ws", //websocket通知
        websocket: "ws://localhost:15674/ws", //websocket通知
        file: "http://localhost:8097/"
        
    },
    qas: {
        auth: "http://172.16.100.28:9999/", // 权限系统 172.16.100.28:9999/
        cap: "http://172.16.100.47:35267/cap/",
        websocket: "ws://172.16.100.23:45674/ws", //websocket通知
        file: "http://172.16.100.43:48413/"
    },
    app: {
        auth: "http://authapi.lesso.com:49310/", // 权限系统
        cap: "http://cap.lesso.com:30027/cap/",
        websocket: "ws://192.168.3.85:15674/ws", //websocket通知
        file: "http://192.168.3.197:49299/"
    }
};
export default apienv;