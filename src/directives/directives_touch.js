import Vue from "vue";

class vueTouch {
  constructor(el, binding, type) {
    this.element = el; //触发的元素
    this.binding = binding; //绑定对象
    this.touchType = type; //触发类型

    this.vueTouches = { x: 0, y: 0 }; //触屏坐标
    this.vueMoves = true; //移动标识
    this.vueLeave = true; //离开标识

    this.vueCallBack = typeof binding.value == "object" ? binding.value.fn : binding.value;

    this.element.addEventListener(
      "touchstart",
      event => {
        this.start(event);
      },
      false
    );
    this.element.addEventListener(
      "touchend",
      event => {
        this.end(event);
      },
      false
    );
    this.element.addEventListener(
      "touchmove",
      event => {
        this.move(event);
      },
      false
    );
  }
  //监听touchmove开始事件
  start(event) {
    this.vueMoves = true;
    this.vueLeave = true;
    this.longTouch = true;
    this.vueTouches = { x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY };
    //  是否长时间按,1s钟为长按
    this.time = setTimeout(() => {
      if (this.vueLeave && this.vueMoves) {
        this.touchType == "longtap" && this.vueCallBack(this.binding.value, event);
        this.longTouch = false;
      }
    }, 1000);
  }
  end(event) {
    let disX = event.changedTouches[0].pageX - this.vueTouches.x; //计算移动的位移差
    let disY = event.changedTouches[0].pageY - this.vueTouches.y;
    // 是否进化为长按
    clearTimeout(this.time);
    // 判断----滑动
    if (Math.abs(disX) > 10 || Math.abs(disY) > 100) {
      //当横向位移大于10，纵向位移大于100，则判定为滑动事件
      this.touchType == "swipe" && this.vueCallBack(this.binding.value, event, "swipe"); //若为滑动事件则返回
      //判断---是横向滑
      if (Math.abs(disX) > Math.abs(disY)) {
        if (disX > 10) {
          this.touchType == "swiperight" && this.vueCallBack(this.binding.value, event, "swiperight"); //右滑
        }
        if (disX < -10) {
          this.touchType == "swipeleft" && this.vueCallBack(this.binding.value, event, "swipeleft"); //左滑
        }
      } else {
        //判断--纵向滑动
        if (disY > 10) {
          this.touchType == "swipedown" && this.vueCallBack(this.binding.value, event, "swipedown"); //下滑
        }
        if (disY < -10) {
          this.touchType == "swipeup" && this.vueCallBack(this.binding.value, event, "swipeup"); //上滑
        }
      }
    } else {
      // 判断---点击
      if (this.longTouch && this.vueMoves) {
        this.touchType == "tap" && this.vueCallBack(this.binding.value, event, "tap");
        this.vueLeave = false;
      }
    }
  }
  //监听touchmove移动中事件
  move(event) {
    this.vueMoves = false;
  }
}
//自定义touch指令
export default {
  directives: {
    //点击事件
    tap: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "tap");
      }
    },
    //滑动事件
    swipe: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "swipe");
      }
    },
    //左滑动
    swipeleft: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "swipeleft");
      }
    },
    //右滑动
    swiperight: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "swiperight");
      }
    },
    //下滑动
    swipedown: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "swipedown");
      }
    },
    //上滑动
    swipeup: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "swipeup");
      }
    },
    //长按
    longtap: {
      //once call 绑定期间掉用
      bind: function(el, binding, vnode) {
        new vueTouch(el, binding, "longtap");
      }
    }
  }
};
