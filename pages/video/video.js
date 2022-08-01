// pages/video/video.js
import request from "../../utils/request";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList:[],//导航标签数据
        navId:'',//导航的标识
        // ddtList:[],
        videoInfoList:[],//视频列表数据
        videoId:'',//视频id标识
        videoUpdateTime:[],//记录video播放的时长
        isTriggered:false,//标识下拉刷新是否被触发
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      //获取导航数据
        this.getVideoGroupListData();

    },


    //获取导航数据
    async getVideoGroupListData() {
        let videoGroupList = await request('/video/group/list');
        this.setData({
            videoGroupList:videoGroupList.data.slice(0,14),
            navId:videoGroupList.data[0].id
        })
    //获取视频列表数据
     this.getListDetail(this.data.navId);
    },
    //获取视频列表数据
    // async getVideoList(navId){
    //     if(!navId){//判断navId为空串的情况
    //         return;
    //     }
    //     let videoListData = await request('/video/group?',{id:navId})
    //     console.log(videoListData);
    // },
    async getListDetail(navId){
        let videoDetails = await request('/video/group',{id:navId},'GET');
        //关闭消息提示框
        wx.hideLoading();
        let videoInfoList = [];
            videoDetails.datas.forEach(i =>{
                videoInfoList.push({
                    id:i.data.vid,
                    title:i.data.title,
                    creator:i.data.creator,
                    commentCount:i.data.commentCount,
                    praisedCount:i.data.praisedCount,
                    coverUrl:i.data.coverUrl,
                    videoUrl:""//新建一个数组videoInfoList，将data数据都push进去
                })

            })
        for (const i of videoInfoList) {
            let result =await request('/video/url',{id:i.id}).then(r =>{
                i.videoUrl = r.urls[0].url
            })
        }



        this.setData({
            videoInfoList:videoInfoList,
            isTriggered:false //关闭下拉刷新
        })
        // wx.hideLoading({
        //     success: (res) => {},
        // })
    },

    //点击切换导航的回调
    changeNav(event){
       let navId = event.currentTarget.id;//通过id向event传参如传的是number会自动转换成string
      // let navId = event.currentTarget.dataset.id;
        this.setData({
            navId: navId >>> 0, //位移转换
            videoInfoList: []
        })
        //显示正在加载
        wx.showLoading({
            title:'正在加载'
        })
        //动态获取当前导航对应的视频数据
        this.getListDetail(this.data.navId);


    },

    //点击播放/继续播放的回调
    handlePlay(event){
    /*
    * 需求：
    *    1：在点击播放的事件中需要找到上一个播放的视频
    *    2：在播放新的视频之前关闭上一个正在播放的视频
    *
    * 关键：
    *    1：如何找到上一个视频的实例对象
    *    2：如何确认点击播放的视频和正在播放的视频不是同一个视频
    * 单例模式：
    *    1：需要创建多个对象的场景下，通过一个对象接收，始终保持只有一个对象；
    *    2：节省内存空间
    * */
        let vid = event.currentTarget.id;
        //关闭上一个播放的视频
       // this.vid !== vid && this.videoContext && this.videoContext.stop();性能优化规避掉
        this.vid = vid;

        //更新data中videoId的状态数据
        this.setData({
            videoId:vid
        })

        //创建控制video标签的实例对象
        this.videoContext  = wx.createVideoContext(vid);
        //判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转至指定的播放位置
        let {videoUpdateTime} = this.data;
        let  videoItem = videoUpdateTime.find(item => item.vid === vid);
        if(videoItem){
              this.videoContext.seek(videoItem.currentTime);
        }
        this.videoContext.play();
    },


    //监听视频播放进度的回调
    handleTimeUpdate(event){
        // console.log(event);
       let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime};
       let {videoUpdateTime}  =  this.data;
        /*
        * 思路：判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
        *    1：如果有，在原有的播放记录中修改播放时间为当前的播放时间
        *    2：如果没有，需要在数组中添加当前视频的播放对象
        *
        * */
        let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
       if(videoItem){//之前有
           videoItem.currentTime = event.detail.currentTime;
       }else{//之前没有
           videoUpdateTime.push(videoTimeObj);
       }
       //更新videoUpdateTime的状态
        this.setData({
            videoUpdateTime
        })
    },


    //视频播放结束调用的回调
    handleEnded(event){
        console.log('播放结束');
        //移除记录播放时长数组中当前视频的对象
        let {videoUpdateTime} = this.data;
        videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1);
        this.setData({
            videoUpdateTime
        })
    },


    //自定义下拉刷新的回调：scroll-view
    handleRefresher(){
        console.log('scroll-view 下拉刷新');
        //再次发请求，获取最新的视频列表数据
        this.getListDetail(this.data.navId);
    },
    // handleloaded() {
    //     点击下一个视频之后再点回原视频，原视频因为被image标签覆盖，需重新加载view，如果网速慢会出现视频声音已经播放，视频没有成功加载出来的问题。
    //     解决：给视频标签绑定bindloadedmetadata方法（视频加载完毕自动调用的方法），在视频加载完毕时再调用自动播放功能
    //     let { videoId, videoUpdateTime } = this.data;
    //     this.videoContext = wx.createVideoContext(videoId);
    //     let videoItem = bindtimeupdateArr.find((item) => item.vid == videoId);
    //     if (videoItem) {
    //         this.videoContext.seek(videoItem.currentTime);
    //     }
    //     this.videoContext.play();
    // },


    //自定义上拉触底的回调:scroll-view
    handleToLower(){
        console.log('scroll-view');
        //数据分页： 1.后端分页 2.前端分页
        //调用例子 : /playlist/track/all?id=24381616&limit=10&offset=1
        console.log('发送请求  ||  在前端截取最新的数据  追加到视频列表的后方');
    },


    //跳转至搜索界面
    toSearch(){
        wx.navigateTo({
            url:'/pages/search/search'
        })
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
    onShareAppMessage({from}) {
           console.log(from);
           return{
               title:'自定义转发内容',
               page:'/pages/video/video',
               imageUrl:'/static/images/zj.jpg'
           }
    }
})