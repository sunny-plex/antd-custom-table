# antd-custom-table
based on ant-design Table, extend header contextMenu settings , and auto fit scroll-x  scoll-y.

## how to use it

> <CustomTable<br/>
>  name={'my-table-1'} <br/>
>  className={'auto-scroll-y'} <br/>
>  columns={this.tableColumns} <br/>
>  dataSource={tableDataSource} <br/>
>  scroll={{x: true, y: true}} <br/>
> />

因为目前还工作比较忙，目前代码有些地方还需要自己修正一下import和redux的持久化代码段，
CSS样式请根据自己的项目风格自己修改，修改表头height的时候请注意 calc 相关的 CSS 语句。
