import Vue from 'vue'

import iView from 'iview'
import '@/style/itheme.less'
import { component } from 'vue-auto-register'

import apiGroup from '@/ajax'
import * as validate from '@/global/validate'
import maxlength from '@/global/maxlength'
import { OPTIONS } from '@/global/cons'
import { filterTimestamp } from '@/global/funs'
import commonColumns from '@/global/columns'
import 'babel-polyfill'

import { loginUser } from '@/global/storage'
import CONFIG from '@/config'
const { DEV_ADMIN } = CONFIG
if (process.env.NODE_ENV === 'development') {
  require('@/ajax/mocker')
  loginUser.set(DEV_ADMIN)
}

Object.keys(OPTIONS).forEach(key => {
  Vue.filter(`f_${key}`, v => OPTIONS.filter(o => o.value === v)[0].label)
})
Object.keys(filterTimestamp).forEach(key => {
  Vue.filter(`f_${key}`, tstamp => filterTimestamp[key](tstamp))
})

Vue.use(iView)
Vue.use(component)

Object.assign(Vue.prototype, {
  $http: apiGroup,
  $ml: maxlength,
  $v: validate,
  $cc: commonColumns
})
