# antd-custom-table
based on ant-design Table, extend header contextMenu settings , and auto fit scroll-x  scoll-y.

## how to use it
`
 <CustomTable
  name={'my-table-1'}
  className={'auto-scroll-y'}
  columns={this.tableColumns}
  dataSource={tableDataSource}
  scroll={{x: true, y: true}}
/>
`
