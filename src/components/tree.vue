<template>
    <div ref="treeWrapperA">
        <el-input type="text" clearable placeholder="选择组织" v-model="parId"
        @focus="showTreeA" 
        ></el-input>
        <ul role="menu" id="cascader-menu-1770" class="el-cascader-menu" style="min-width: 400px;position: absolute;z-index: 1000;border: solid 1px #e4e7ed;"   v-show="isTreeShowA">
            <el-tree class="filter-tree" :data="options" node-key="id"  ref="treeA" 
                highlight-current @check="handleNodeClickA" show-checkbox
            :default-checked-keys="[67,65]" :default-expanded-keys="[67,65]"> </el-tree>
        </ul>
    </div>
</template>

<script>
//  import _APIS from "@/api";
    import Vue from "vue";

    export default Vue.extend({
        data(){
			return{
                parId:'',
                parId_arr:[],
                isTreeShowA : false,
                props:{
                    value: 'id',
                    children: 'children'
                },
                organizeList:[],
                filterTreeShow:false
			}
        },
        created(){
            this.getOrgInfo(true)
        },
        showTreeA(){
            var that = this;
            this.isTreeShowA = true
            // console.log(this.$refs)
            this.$nextTick(_=>{
                document.addEventListener('click',function(e){
                    if(!that.$refs.treeWrapperA) return;
                    if(that.$refs.treeWrapperA.contains(e.target)){
                        return;
                    }else{
                        that.isTreeShowA = false
                        
                    }
                    
                })
            })
        },
        handleNodeClickA(a,b,c){
            var that = this;
            console.log(a,b,c)
            // that.Form_parId =
            var labelList = b.checkedNodes
            var werks = []
            var WSCode = []
            that.parId = ''
            that.parId_arr = []

            labelList.forEach(item=>{
                if(item.type == 30){
                    werks.push(item)
                }
                if(item.type == 40){
                    WSCode.push(item)
                }
            })

            if(werks.length == 0 && WSCode.length != 0){
                that.parId += WSCode[0].label
                that.parId_arr = WSCode
            }else{
                werks.forEach((item,i)=>{
                    if(!item.children){
                        that.parId += item.label
                    }else{
                        item.children.forEach((btem,b)=>{
                            if(i == werks.length - 1 && b == item.children.length - 1){
                                that.parId += btem.label
                            }else{
                                that.parId += btem.label+ '，'
                            }
                        })
                    }
                })
                that.parId_arr = werks
            }

            if(that.parId_arr.length == 0 && WSCode.length == 0&&labelList.length!=0){
                that.$alert("选择的节点非工厂或车间", "消息提示", {
                    confirmButtonText: "确定"
                });
            }

            if(b.halfCheckedNodes.length > b.checkedNodes.length){
                // 说明有半选工厂
                that.parId = ''
                WSCode.forEach((item,i)=>{
                    if(i == WSCode.length - 1 ){
                        that.parId += item.label
                    }else{
                        that.parId += item.label+ '，'
                    }

                    that.parId_arr = []

                    that.organizeList.forEach(function(btem){
                        if(btem.ID == item.id){
                            var parId = btem.parId
                            that.organizeList.forEach(function(ctem){
                                if(ctem.ID == parId){
                                    that.parId_arr.push({
                                        children:[item],
                                        code:ctem.orgCode
                                    })
                                }
                            })
                        }
                    })
                })
            }
        }
    })
</script>