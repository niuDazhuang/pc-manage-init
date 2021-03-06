import bus from '@/bus'
import $store from '@/vuex'
import $router from '@/router'
import { download } from './funs'
import { filterTimestamp } from '@/global/funs'
import { Modal, Message } from 'iview'
import $http from '@/ajax'

const hDownload = (h, params, {text} = {text: '下载'}) => h('Button', {
  props: {
    type: 'success',
    size: 'small'
  },
  attrs: {style: 'margin-right: 10px'},
  on: {
    click: (e) => {
      e.stopPropagation()
      download(params.row.link || params.row.path || params.row.src)
    }
  }
}, text)

const hDetail = (h, params, {modal, router, text}) => h('Button', {
  props: {
    type: 'warning',
    size: 'small'
  },
  attrs: {style: 'margin-right: 10px'},
  on: {
    click: (e) => {
      e.stopPropagation()
      if (modal) {
        $store.dispatch('modal', {show: modal, detail: params.row})
      }
      if (router) {
        $router.push(router)
      }
    }
  }
}, text || '详情')

const hEdit = (h, params, {modal, router, text}) => h('Button', {
  props: {
    type: 'info',
    size: 'small'
  },
  attrs: {style: 'margin-right: 10px'},
  on: {
    click: (e) => {
      e.stopPropagation()
      if (modal) {
        $store.dispatch('modal', {show: modal, detail: params.row})
      }
      if (router) {
        $router.push(router)
      }
    }
  }
}, text || '编辑')

const hDel = (h, params, {api}) => h('Button', {
  props: {
    type: 'error',
    size: 'small'
  },
  on: {
    click: e => {
      e.stopPropagation()
      let row = params.row
      Modal.confirm({
        title: '操作确认',
        content: `确定删除该条记录（行号： ${row._index + 1}）？`,
        onOk: () => {
          if (!$http[api].del) return alert(`没找到api: ${api}.del`)
          $http[api].del(row).then(res => {
            Message.success('删除成功！')
            bus.$emit('update')
          })
        }
      })
    }
  }
}, '删除')

export default {
  selection: {
    width: 60,
    type: 'selection',
    align: 'center'
  },
  orderIndex: {
    width: 70,
    title: '序号',
    render: (h, params) => h('span', params.row._index + 1)
  },
  ctime: {
    width: 160,
    title: '创建时间',
    key: 'ctime',
    sortable: true,
    render: (h, params) => h('span', filterTimestamp.toDateTime(params.row.ctime))
  },
  atime: {
    width: 160,
    title: '激活时间',
    key: 'atime',
    sortable: true,
    render: (h, params) => h('span', filterTimestamp.toDateTime(params.row.atime))
  },
  hDownload,
  hDetail,
  hEdit,
  hDel,
  del: ({api}) => ({
    title: '操作',
    key: 'action',
    render: (h, params) => hDel(h, params, api)
  })
}
