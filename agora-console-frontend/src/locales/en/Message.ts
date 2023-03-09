const en = {
  messagesType: [
    { name: 'All', type: 'all' },
    { name: 'Account', type: 'account' },
    { name: 'Billing', type: 'finance' },
    { name: 'Product', type: 'product' },
    { name: 'Operation', type: 'operation' },
    { name: 'Promotion', type: 'promotion' },
    { name: 'Tickets', type: 'tickets' },
  ],
  messagesTypeWithoutFinance: [
    { name: 'All', type: 'all' },
    { name: 'Product', type: 'product' },
    { name: 'Operation', type: 'operation' },
    { name: 'Promotion', type: 'promotion' },
  ],
}

const MessageI18nEn = Object.assign({}, en)

export default MessageI18nEn
