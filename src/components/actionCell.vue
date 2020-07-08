<!-- 操作列组件 -->
<template>
    <div class="m-component-actionCell">
        <!-- 一般为修改 -->
        <a
            @click="clickFirst"
            class="action-btn"
            v-if="params.data.firstShow == undefined ? false : params.data.firstShow"
            >{{ firstBtn }}</a
        >
        <!-- 一般为删除 -->
        <a
            @click="clickSecond"
            class="action-btn"
            v-if="params.data.secondShow == undefined ? false : params.data.secondShow"
            >{{ secondBtn }}</a
        >
        <!-- 一般为下载 -->
        <a
            @click="clickThird"
            class="action-btn"
            v-if="params.data.thirdShow == undefined ? false : params.data.thirdShow"
            >{{ thirdBtn }}</a
        >
        <!-- 一般为下载 -->
        <a
            @click="clickFourth"
            class="action-btn"
            v-if="params.data.fourthShow == undefined ? false : params.data.fourthShow"
            >{{ fourthBtn }}</a
        >
    </div>
</template>

<script>
export default {
    name: 'actionCell',
    data() {
        return {
            firstBtn: '', //第一个按钮-文本
            secondBtn: '', //第二个按钮-文本
            thirdBtn: '', //第三个按钮-文本
            fourthBtn: '' //第四个按钮-文本
        }
    },
    methods: {
        //第一个按钮
        clickFirst() {
            this.params.context.componentParent.clickFirst(this.params.data)
        },
        //第二个按钮
        clickSecond() {
            this.params.context.componentParent.clickSecond(this.params.data)
        },
        //第二个按钮
        clickThird() {
            this.params.context.componentParent.clickThird(this.params.data)
        },
        //第二个按钮
        clickFourth() {
            this.params.context.componentParent.clickFourth(this.params.data)
        }
    },
    mounted() {
        //从父组件处获取单元格渲染的按钮文本内容（父组件data需包含firstBtn，secondBtn属性）
        this.firstBtn = this.params.context.componentParent.firstBtn || '修改'
        this.secondBtn = this.params.context.componentParent.secondBtn || '删除'
        this.thirdBtn = this.params.context.componentParent.thirdBtn || '下载'
        this.fourthBtn = this.params.context.componentParent.fourthBtn || '下载附件'
    }
}
</script>
<style lang="less">
.m-component-actionCell {
    .action-btn {
        color: #1b5cf3;
        cursor: pointer;
    }
    .action-btn + .action-btn {
        border-left: 1px solid rgba(192, 196, 204, 0.5);
        padding: 0 0 0 5px;
        margin-left: 2px;
        cursor: pointer;
    }
}
</style>
