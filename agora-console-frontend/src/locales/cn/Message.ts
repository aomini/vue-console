const cn = {
  messagesType: [
    { name: '全部', type: 'all' },
    { name: '账号', type: 'account' },
    { name: '费用', type: 'finance' },
    { name: '产品', type: 'product' },
    { name: '运营', type: 'operation' },
    { name: '推广', type: 'promotion' },
    { name: '工单', type: 'tickets' },
  ],
  messagesTypeWithoutFinance: [
    { name: '全部', type: 'all' },
    { name: '产品', type: 'product' },
    { name: '运营', type: 'operation' },
    { name: '推广', type: 'promotion' },
  ],
}

const MessageI18nCn = Object.assign({}, cn)

export default MessageI18nCn
