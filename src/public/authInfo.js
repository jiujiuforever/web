//获取当前用户授权公司信息
import _Api from "@/api";
import constant from "@/public/constant";

export default{
	getAuthCompanyList(userId){
        return new Promise((resolve, reject)=>{
        	_Api.userManage_getUserAuthCompany({userId:userId}).then(({data})=>{
        		if(data.code == "1"){
        			resolve(data.rows);
        		}else{
        			reject(data.info);
        		}
        	}).catch((err)=>{
        		reject('获取当前用户授权公司失败');
        	})
        })
	}
}