// pages/login/login.js
/*
* 作者: created by vizh
* 说明：登录流程
*   1：收集表单数据
*   2：前端验证
*      1)验证用户信息(账号， 密码)是否合法
*      2)前端验证不通过就提示用户， 不需要发请求给后端
*      3)前端验证通过了，发请求(携带账号密码)给服务器端
*   3：后端验证
*      1)验证用户是否存在
*      2)用户不存在直接返回，告诉前端用户不存在
*      3)用户存在需要验证密码是否正磅
*      4)密码不正确返回给前端提示密码不正确
*      5)密码正确返回给前端数据，提示用户登录成功(会携带用户的相关信息)
* */


import request from "../../utils/request";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        email:'',//邮箱号
       password:''//用户密码
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    //表单项内容发生改变的回调
    handleInput(event){
       // let type = event.currentTarget.id;//id传值  //取值：phone || password
        let type = event.currentTarget.dataset.type;//data-key=value从事传参
       // console.log(type,event.detail.value);
       this.setData({
           [type]:event.detail.value
       })
    },


    //登录的回调
    async login() {
        //1.收集表单数据
        let {email, password} = this.data;
        //2.前端验证
        /*
        * 手机号验证：
        *   1.内容为空
        *   2.手机号格式不正确
        *   3.手机号格式正确，验证通过
        * */

        if (!email) {
            //提示用户
            wx.showToast({
                title: '邮箱不能为空',
                icon: 'none'
            })
        }
        //定义正则表达式
        let emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;//只允许英文字母、数字、下划线、英文句号、以及中划线组成
        if (!emailReg.test(email)) {
            wx.showToast({
                title: '邮箱格式错误',
                icon: 'none'
            })
            return;
        }

        if (!password) {
            wx.showToast({
                title: '密码不能为空',
                icon: 'none'
            })
            return;
        }

        //后端验证
        //let result = 'https://netease-cloud-music-api-one-tau-94.vercel.app/user/detail?uid=32953014'
        let result = await  request('/login', {email,password,isLogin:true,});
        console.log(result)
        //将用户的信息存储至本地
        wx.setStorageSync('userInfo',JSON.stringify(result.profile))


        //跳转至个人中心personal页面
        wx.reLaunch({
            url:'/pages/personal/personal'
        })
        if(result.code ==  200){
            wx.showToast({   //登录成功
                title:'登录成功'
            })


        }else if(result.code == 400){
              wx.showToast({
                  title:'手机号错误',
                  iconL:'none'
              })
        }else if(result.code == 502){
            wx.showToast({
                title:'密码错误',
                iconL:'none'
            })
        }else{
            wx.showToast({
                title:'登录失败，请重新登录',
                iconL:'none'
            })
        }
    },



    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})