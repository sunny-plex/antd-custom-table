import React from 'react'
import { Checkbox, Input, Icon, Table, Menu, DropDown, Modal, ClassNameX } from '@/components/ui'
import { combineComponent } from '@/utils/combiner'
import dispatchX from '@/utils/dispatch-x'
import { objectString } from '@/utils/common'
import { Resizable } from 'react-resizable'

import './custom-table.xcss'

class CustomTable extends React.Component {

  state = {
    customTableProps: {}
  }

  tableSettingModalState = {
    dragSourceIndex: null,
    dragTargetIndex: null
  }

  tableOnColumnResize = (index) => (e, { size }) => {
    const { customTableProps } = this.state
    if (customTableProps.columns[index].dataIndex !== 'index') {
      customTableProps.columns[index].width = size.width || 0
      setTimeout(() => {
        if (customTableProps.columns[index].width === size.width) {
          this.handleSaveSetting()
        }
      }, 200)
      this.setState({customTableProps})
    }
  }

  tableResizableTitle = (props) => {
    const { onResize, width, ...restProps } = props
    return (
      <DropDown trigger={['contextMenu']} overlay={this.DOMContextMenu()}>
        <Resizable width={Number(width) || 0} height={0} axis={'x'} onResize={onResize}>
          <th width={width} style={{minWidth: width, maxWidth: width}} {...restProps} />
        </Resizable>
      </DropDown>
    )
  }

  tableHookedComponents = {
    header: {
      cell: this.tableResizableTitle
    }
  }

  tableSettingModalContent = () => {
    const { tableSettingModalState } = this
    const { columns } = this.state.customTableProps
    return (
      <div className={'custom-table-setting'}>
        <table>
          <thead>
            <tr>
              <th>表头标题</th>
              <th>宽度</th>
              <th>显示表头</th>
              <th>排序</th>
            </tr>
          </thead>
          <tbody>
            {
              columns.filter((col) => col.dataIndex !== 'index').map((col, index) => {
                return (
                  <tr
                    className={ClassNameX('setting-row', {
                      'drag-source': tableSettingModalState.dragSourceIndex === index,
                      'drag-target': tableSettingModalState.dragTargetIndex === index
                    })}
                    key={`tt_${col.title}`}
                  >
                    <td>{col.title}</td>
                    <td>
                      <Input type={'text'} onInput={this.handleSettingWidth(index)} placeholder={'自动'} defaultValue={col.width} maxLength={3} />
                    </td>
                    <td>
                      <Checkbox size={'small'} onChange={this.handleSettingColumnShowSwitch(index)} defaultChecked={!col.hide} />
                    </td>
                    <td
                      draggable={true}
                      onDragStart={this.handleSettingRowOnDragStart(index)}
                      onDragOver={this.handleSettingRowOnDragOver(index)}
                      onDragEnd={this.handleSettingRowOnDragEnd(index)}
                    >
                      <Icon type={'swap'} style={{transform: 'rotate(90deg)', fontSize: 16}} />
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )
  }

  tableSettingModalRender = (() => {})

  handleSaveSetting = () => {
    const { name, customTableSettings } = this.props
    const { customTableProps } = this.state
    // if this table has a name
    if (name) {
      // save custom setting in redux state
      dispatchX({
        type: 'GLOBAL/customTableSettings',
        payload: Object.assign({}, Object.assign(customTableSettings, {
          [name]: {
            columns: JSON.parse(objectString(customTableProps.columns))
          }
        }))
      })
    }
  }

  handleResetSetting = () => {
    const { name, customTableSettings } = this.props
    dispatchX({
      type: 'GLOBAL/customTableSettings',
      payload: Object.assign({}, Object.assign(customTableSettings, {
        [name]: undefined
      }))
    })
  }

  handleSettingColumnShowSwitch = (index) => {
    return (event) => {
      const { customTableProps } = this.state
      const { columns } = customTableProps
      columns[index + 1].hide = !event.target.checked
    }
  }

  handleSettingWidth = (index) => {
    return (event) => {
      const { customTableProps } = this.state
      const { columns } = customTableProps
      columns[index + 1].width = Number(event.target.value)
    }
  }

  handleSettingRowOnDragStart = (index) => {
    return () => {
      this.tableSettingModalState.dragSourceIndex = index
      this.tableSettingModalRender({
        content: this.tableSettingModalContent.bind(this)()
      })
    }
  }

  handleSettingRowOnDragOver = (index) => {
    return (event) => {
      event.preventDefault()
      if (this.tableSettingModalState.dragTargetIndex !== index) {
        this.tableSettingModalState.dragTargetIndex = index
        setTimeout(this.tableSettingModalRender, 0, {
          content: this.tableSettingModalContent.bind(this)()
        })
      }
    }
  }

  handleSettingRowOnDragEnd = () => {
    return () => {
      const { customTableProps } = this.state
      const { columns } = customTableProps
      // make column exchange
      const tempCol = columns[this.tableSettingModalState.dragSourceIndex + 1]
      columns.splice(this.tableSettingModalState.dragSourceIndex + 1, 1)
      columns.splice(this.tableSettingModalState.dragTargetIndex + 1, 0, tempCol)
      // update setting modal
      this.tableSettingModalState.dragSourceIndex = this.tableSettingModalState.dragTargetIndex
      this.tableSettingModalRender({
        content: this.tableSettingModalContent.bind(this)()
      })
      setTimeout(() => {
        this.tableSettingModalState.dragSourceIndex = null
        this.tableSettingModalState.dragTargetIndex = null
        this.tableSettingModalRender({
          content: this.tableSettingModalContent.bind(this)()
        })
      }, 400)
    }
  }

  handleCustomTableModal = () => {
    const { customTableSettings } = this.props
    this.tableSettingModalRender = Modal.dialog({
      title: '高级设置',
      width: '400px',
      draggable: true,
      content: this.tableSettingModalContent.bind(this)(),
      onOk: (e, updateRender) => {
        this.handleSaveSetting()
        // close and destroy this modal
        updateRender({visible: false})
      },
      onCancel: () => {
        dispatchX({
          type: 'GLOBAL/customTableSettings',
          payload: Object.assign({}, customTableSettings)
        })
      }
    })
  }

  hookTableOnRow = () => {
    return {
      // onClick or some events
    }
  }

  DOMContextMenu = (MenuItem = Menu.Item) => (
    <Menu>
      <MenuItem key={'1'} onClick={this.handleCustomTableModal}>高级选项</MenuItem>
      <MenuItem key={'2'} onClick={this.handleResetSetting}>恢复默认</MenuItem>
    </Menu>
  )

  customTableProps = (nextProps) => {
    const newProps = Object.assign({}, nextProps)
    const { columns } = newProps
    const newColumns = columns.map((column) => {
      return Object.assign({}, column)
    })
    newProps._onRow = newProps.onRow || (() => {})
    newProps.onRow = (row) => {
      return Object.assign(this.hookTableOnRow(row), newProps._onRow(row))
    }
    newProps.components = Object.assign(this.tableHookedComponents, newProps.components || {})
    return Object.assign(newProps, {columns: newColumns})
  }

  mergePropsFromCustomTableSetting = (props) => {
    const { name, customTableSettings } = props
    const currentProps = this.customTableProps(props)
    if (name && customTableSettings) {
      if (customTableSettings[name]) {
        currentProps.columns = customTableSettings[name].columns.map((col) => {
          return Object.assign(currentProps.columns.filter(column => column.dataIndex === col.dataIndex)[0] || {}, col)
        })
      }
    }
    currentProps.columns.map((column, index) => {
      column.onHeaderCell = col => ({
        width: col.width,
        onResize: this.tableOnColumnResize(index)
      })
      column._render = column.render || ((text, row, index, width) => (
        <div style={{width: typeof(width) === 'string' ? width : width + 'px', overflow: 'hidden'}}>{text}</div>)
      )
      column.render = (text, row, index) => {
        return column._render(text, row, index, column.width || 'auto')
      }
    })
    return currentProps
  }

  componentWillMount() {
    this.setState({customTableProps: this.mergePropsFromCustomTableSetting(this.props)})
  }

  componentWillReceiveProps(nextProps) {
    this.setState({customTableProps: this.mergePropsFromCustomTableSetting(nextProps)})
  }

  render() {
    const { customTableProps } = this.state
    const tableProps = Object.assign(Object.assign({}, customTableProps), {
      columns: customTableProps.columns ? customTableProps.columns.filter(col => !col.hide) : []
    })
    return (
      customTableProps.columns ? <Table {...tableProps} /> : <div className={'table-none-columns'} />
    )
  }
}

export default combineComponent({
  c: CustomTable,
  modelEx: [
    {
      namespace: 'GLOBAL',
      stateProp: 'customTableSettings'
    }
  ]
})
