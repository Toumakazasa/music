import request from "../../utils/request";
let isSend = false;//函数节流使用
Page({

    /**
     * 页面的初始数据
     */
    data: {
       placeholderContent:'',//placeholder的内容
       hotList:[],//热搜榜数据
       searchContent:'',//用户输入的表单项数据
       searchList:[],//关键字模糊匹配的数据
       historyList:[],//搜索历史记录
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        //获取初始化数据
        this.getInitData();

        //获取历史记录
        this.getSearchHistory();
    },
    //获取初始化的数据
    async getInitData(){
      let placeholderData = await request('/search/default');
      let hotListData = await request('/search/hot/detail')
      this.setData({
          placeholderContent:placeholderData.data.showKeyword,
          hotList:hotListData.data
      })
    },


    //获取本地历史记录的功能函数
    getSearchHistory(){
      let historyList = wx.getStorageSync('searchHistory')
        if(historyList){
            this.setData({
                historyList
            })
        }
    },


    //表单项内容发生改变的回调
     handleInputChange(event) {
        /*console.log(event)*/
        //更新searchContent的状态数据
        this.setData({
            searchContent: event.detail.value.trim()
        })

         if(isSend){
             return
         }
         isSend = true;
         this.getSearchList();
         //函数节流
          setTimeout(async() => {

              isSend = false;
        },3000)

    },

    //获取搜索数据的功能函数
    async getSearchList() {
        if(!this.data.searchContent){
            this.setData({
                searchList:[]
            })
            return;
        }
        //发请求获取关键字模糊匹配数据
        let {searchContent,historyList} = this.data;
        let searchListData = await request('/search', {keywords:searchContent, limit: 10});
        this.setData({
            searchList: searchListData.result.songs
        })

        //将搜索的关键字添加到搜索历史记录中
        if(historyList.indexOf(searchContent) !== -1){
            historyList.splice(historyList.indexOf(searchContent),1)  //数组中有该历史记录，删除
        }
        historyList.unshift(searchContent);//添加上
        this.setData({
            historyList
        })
        wx.setStorageSync('searchHistory',historyList)
    },

    //清空搜索内容
    clearSearchContent(){
        this.setData({
            searchContent:'',
            searchList:[]    //将表单记录和匹配到的模糊数据都重新赋值为空，而不是删除
        })
    },


    //删除搜索历史记录
    deleteSearchHistory(){

        wx.showModal({
            content:'确认删除吗？',
            success:(res) => {
               if(res.confirm){
                   //清空data中historyList
                   this.setData({
                       historyList:[]
                   })
                   //移除本地中历史记录缓存
                   wx.removeStorageSync('searchHistory');   //点击确认删除搜索历史记录
               }
            }
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
    onShareAppMessage() {

    }
})