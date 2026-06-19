export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/knowledge/index',
    'pages/mine/index',
    'pages/consent/index',
    'pages/question/index',
    'pages/confirm/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4EA3A0',
    navigationBarTitleText: '齿科知情同意',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#4EA3A0',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '预约'
      },
      {
        pagePath: 'pages/knowledge/index',
        text: '须知'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
