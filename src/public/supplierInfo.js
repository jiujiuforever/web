/*
 获取当前用户信息
 * */
import _Api from "@/api";

export default{
	getUserInfo(mainAccount){
//		var that = this;
		var obj = {
			"mainAccount":mainAccount
		}
		return new Promise((resolve, reject) => {
			_Api.getSupplierDetailByAccount(obj).then(function(response){
				var data = response.data;
				if(data.code == "1"){
					if(data.total > 0){
						// return data.rows;
						resolve(data.rows);
					}else{
						resolve([])	;
					}
				}else{
					reject("获取失败");
				}
			}).catch(()=>{
				reject("获取失败");
			})
		}).catch(function(error){
			console.log("调用供应商信息Promise失败!");
		})
	}
}