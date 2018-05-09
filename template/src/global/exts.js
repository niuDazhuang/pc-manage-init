import Vue from 'vue'

import iView from 'iview'
// 修改主题
import '@/style/itheme.less'

// 将元素传送挂载到body下（ 指令：v-dom-portal ）
// import DomPortal from '@/plugins/dom-portal'
// 滚动条样式插件 (指令：v-scrollbar)
// import Scrollbar from 'smooth-scrollbar'
import components from '@/components'
import apiGroup from '@/ajax'
import * as validate from '@/global/validate'
import { OPTIONS } from '@/global/cons'
import { filterTimestamp } from '@/global/funs'
import commonColumns from '@/global/columns'
import 'babel-polyfill'

Object.keys(OPTIONS).forEach(key => {
  Vue.filter(`f_${key}`, index => OPTIONS[key][index] || '--') // 从 0 开始
  Vue.filter(`f_${key}1`, index => OPTIONS[key][index - 1] || '--') // 从 1 开始
})
Object.keys(filterTimestamp).forEach(key => {
  Vue.filter(`f_${key}`, tstamp => filterTimestamp[key](tstamp))
})

Vue.use(iView)
// Vue.use(DomPortal)
// Vue.directive('scrollbar', {
//   inserted: function (el, binding) {
//     Scrollbar.init(el, binding.value || {})
//   }
// })
Object.keys(components).forEach(key => {
  Vue.component(key, components[key])
})

Object.assign(Vue.prototype, {
  $http: apiGroup,
  $ml: validate.ml,
  $v: validate,
  $cc: commonColumns
})