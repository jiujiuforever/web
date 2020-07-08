//获取服务器时间
import _Api from "@/api";

export default{
	getServiceTime(){
		return new Promise((resolve, reject) => {
			_Api.getServerTime().then(function(response){
				let data = response.data
				if(data.code =="1"){
                    let dt = new Date(data.timestamp)
					resolve(dt)
				}else{
					reject(data.info)
				}
			}).catch((err)=>{
				reject('获取服务器时间失败！')
			})
		})
	}
}
