import React, { Component, PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  Card,
  Badge,
  Menu,
  Divider,
  List,
  Avatar,
  Dropdown,
  Icon,
  Modal,
  notification,
} from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './Detail.less';

const { Item: FormItem } = Form;
const { TextArea } = Input;
const { Option } = Select;
const { Description } = DescriptionList;
const orderStatusMap = {
  1000: {
    text: '平台审核',
    style: 'processing',
  },
  2001: {
    text: '审核失败',
    style: 'error',
  },
  2002: {
    text: '用户取消',
    style: 'warning',
  },
  1001: {
    text: '物流取件',
    style: 'processing',
  },
  2003: {
    text: '取件失败',
    style: 'error',
  },
  1002: {
    text: '验收书籍',
    style: 'processing',
  },
  1003: {
    text: '书费到账',
    style: 'success',
  },
};
const BOOK_STATUS_MAP = {
  1000: '待审核',
  1001: '验收通过',
  2001: '验收不通过',
};

@Form.create()
class RejectForm extends PureComponent {
  state = {
    fileList: [],
  };

  handleDenyUpdate = fieldsValue => {
    const { handleDeny } = this.props;
    const { fileList } = this.state;
    const formData = new FormData();
    const { file, ...restFields } = fieldsValue;
    Object.keys(restFields).forEach(key => {
      formData.append(key, fieldsValue[key]);
    });
    if (fileList.length > 0) {
      formData.append('file', fileList[0]);
    }
    handleDeny(formData);
  };

  render() {
    const { visible, form, handleReject, isDeny, handleModalVisible } = this.props;
    const { fileList } = this.state;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        form.resetFields();
        this.setState({ fileList: [] });
        if (isDeny) {
          this.handleDenyUpdate(fieldsValue);
        } else {
          handleReject(fieldsValue);
        }
        handleModalVisible(false);
      });
    };

    const uploadProps = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          if (!newFileList.length) {
            form.setFields({
              file: {
                value: null,
              },
            });
          }
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        // eslint-disable-next-line
        this.setState(state => ({
          fileList: [file],
        }));
        return false;
      },
      fileList,
      accept: '.jpg,.JPG,.jpeg,.JPEG,.png,.gif,.bmp,.apng,.webp',
    };
    return (
      <Modal
        destroyOnClose
        title="填写原因"
        visible={visible}
        onOk={okHandle}
        onCancel={() => handleModalVisible(false)}
      >
        <FormItem key="reason" wrapperCol={{ span: 16, offset: 4 }}>
          {form.getFieldDecorator('reason', {
            rules: [{ required: true, message: '拒收原因不能为空！' }],
          })(<TextArea rows={4} placeholder="请填写拒收原因" />)}
        </FormItem>
        {isDeny && (
          <FormItem key="file" wrapperCol={{ span: 16, offset: 4 }}>
            {form.getFieldDecorator('file', {
              rules: [{ required: true, message: '请上传图片！' }],
            })(
              <Upload {...uploadProps}>
                <Button icon="upload">上传图片</Button>
              </Upload>
            )}
          </FormItem>
        )}
      </Modal>
    );
  }
}

const UpdateForm = Form.create()(props => {
  const { visible, form, handleUpdate, handleModalVisible, data } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleUpdate(fieldsValue);
      handleModalVisible(false);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="修改内容"
      visible={visible}
      onOk={okHandle}
      onCancel={() => handleModalVisible(false)}
    >
      <FormItem key="name" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="书名">
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '书名不能为空！' }],
          initialValue: data.name,
        })(<Input placeholder="请填写" />)}
      </FormItem>
      <FormItem
        key="expectIncome"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="预计价格"
      >
        {form.getFieldDecorator('expectIncome', {
          rules: [{ required: true, message: '书名不能为空！' }],
          initialValue: data.expectIncome,
        })(<InputNumber min={0} placeholder="请填写" />)}
      </FormItem>
      <FormItem key="bookStatus" labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="图书状态">
        {form.getFieldDecorator('bookStatus', {
          initialValue: BOOK_STATUS_MAP[data.bookStatus],
        })(
          <Select placeholder="请选择" style={{ width: '120px' }}>
            <Option value="1000">待审核</Option>
            <Option value="1001">验收通过</Option>
            <Option value="2001">验收不通过</Option>
          </Select>
        )}
      </FormItem>
    </Modal>
  );
});

const ListItemDesc = ({ author, press, expectIncome, actualIncome, bookStatus }) => (
  <Fragment>
    <div className={styles.descItem}>作者：{author}</div>
    <div className={styles.descItem}>出版社：{press}</div>
    <div className={styles.descItem}>预计价格：{expectIncome}</div>
    <div className={styles.descItem}>实际价格：{actualIncome}</div>
    <div className={styles.descItem}>图书状态：{BOOK_STATUS_MAP[bookStatus]}</div>
  </Fragment>
);

const MoreBtn = props => (
  <Dropdown
    overlay={
      <Menu onClick={({ key }) => props.onClick(key, props.current, props.index)}>
        <Menu.Item key="edit">修改内容</Menu.Item>
        <Menu.Item key="mark">此书异常</Menu.Item>
      </Menu>
    }
  >
    <a>
      更多 <Icon type="down" />
    </a>
  </Dropdown>
);

/* eslint react/no-multi-comp:0 */
@connect(({ recycleDetail, loading }) => ({
  recycleDetail,
  loading: loading.effects['recycleDetail/fetch'],
}))
class RecycleDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      updateModalVisible: false,
      bookAllPassed: false,
      isDeny: false,
      selectRow: {},
    };

    this.orderCode = null;
    this.bookIndex = null;
  }

  componentDidMount() {
    const {
      match: {
        params: { orderCode },
      },
    } = this.props;

    this.orderCode = orderCode;
    this.fetchOrder(this.orderCode);
  }

  setOrderStatus () {
    this.setState({
      bookAllPassed: this.checkOrderStatus(1002), // 检测是否是验收书籍状态
    })
  }

  handleModalVisible = bool => {
    this.setState({
      modalVisible: bool,
    });
  };

  handleUpdateModalVisible = bool => {
    this.setState({
      updateModalVisible: bool,
    });
  };

  handlePrint = e => {
    e.preventDefault();
  };

  handleReject = fields => {
    this.updateOrder({ ...fields, orderCode: this.orderCode, status: 2001 }); // 审核不通过
  };

  handleDeny = fields => {
    const { selectRow } = this.state;
    fields.append('orderCode', this.orderCode);
    fields.append('bookCode', selectRow.bookCode);
    this.updateOrder(fields, true); // 拒收图书
  };

  doReject = isDeny => {
    this.setState({ isDeny });
    this.handleModalVisible(true);
  };

  handleUpdate = fields => {
    const {
      recycleDetail: { order },
    } = this.props;
    const { bookInfos, orderStatus: status } = order;
    const newBookInfos = bookInfos.map((bookInfo, i) => {
      if (i === this.bookIndex) {
        return { ...bookInfo, ...fields };
      }
      return bookInfo;
    });
    this.updateOrder({ bookList: newBookInfos, orderCode: this.orderCode, status }, false, true);
  };

  handleBookItem = (key, currentItem, index) => {
    this.bookIndex = index;
    this.setState({ selectRow: currentItem }, () => {
      switch (key) {
        case 'edit':
          this.handleUpdateModalVisible(true);
          break;
        case 'mark':
          this.doReject(true);
          break;
        default:
      }
    });
  };

  updateOrderStatus(status) {
    const {
      recycleDetail: { order },
    } = this.props;
    const { bookInfos } = order;
    this.updateOrder({ bookList: bookInfos, orderCode: this.orderCode, status });
  }

  checkOrderStatus(status) {
    const { recycleDetail: { order } } = this.props;
    const isAllPassed = order.bookInfos.every(book => book.bookStatus === 1001);
    return isAllPassed && order.orderStatus === status;
  }

  fetchOrder(orderCode) {
    const { dispatch } = this.props;

    return dispatch({
      type: 'recycleDetail/fetch',
      payload: {
        orderCode,
      },
      callback: () => {
        this.setOrderStatus(); // 订单状态设置
      }
    });
  }

  handleOrder(actionType) {
    Modal.confirm({
      title: '提示信息',
      content: '确定要执行此操作吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        let status;
        if (actionType === 'check') { // 审核通过
          status = 1001;
        }
        else if (actionType === 'payment') { // 书费到账
          status = 1003;
        }
        this.updateOrder({
          orderCode: this.orderCode,
          status,
        });
      },
    });
  }

  updateOrder(payload, isDeny, autoCheck) {
    const { dispatch } = this.props;
    dispatch({
      type: 'recycleDetail/update',
      payload,
      isDeny,
      callback: () => {
        this.fetchOrder(this.orderCode).then(() => {
          if (autoCheck && this.checkOrderStatus(1001)) { // 检测是否是物流取件状态
            this.updateOrderStatus(1002); // 验收书籍
          }
        });
        notification.success({
          message: '提示信息',
          description: '更新成功！',
        });
      },
    });
  }

  render() {
    const {
      recycleDetail: { order },
      loading,
    } = this.props;

    const { modalVisible, updateModalVisible, selectRow, isDeny, bookAllPassed } = this.state;
    const parentMethods = {
      handleReject: this.handleReject,
      handleDeny: this.handleDeny,
      handleModalVisible: this.handleModalVisible,
    };
    const updateMethods = {
      handleUpdate: this.handleUpdate,
      handleModalVisible: this.handleUpdateModalVisible,
    };

    let orderActions = null;

    if (order.orderStatus === 1000) {
      orderActions = (
        <Fragment>
          <Button type="primary" icon="check-circle" onClick={() => this.handleOrder('check')}>
            验收订单并快递下单
          </Button>
          <Button type="danger" icon="close-circle" onClick={() => this.doReject(false)}>
            验收不通过
          </Button>
        </Fragment>
      );
    }

    if (bookAllPassed) {
      orderActions = (
        <Button type="primary" icon="check-circle" onClick={() => this.handleOrder('payment')}>
          验收书籍并交付书费
        </Button>
      );
    }

    return (
      <PageHeaderWrapper title="回收订单详情页" action={orderActions}>
        <Card bordered={false}>
          <a className={styles.topNav} onClick={router.goBack}>
            <Icon type="left" />
            返回订单列表
          </a>
          <DescriptionList size="large" style={{ marginBottom: 32 }}>
            <Description term="订单号">{order.orderCode}</Description>
            <Description term="预计收入">{order.expectIncome}</Description>
            <Description term="实际收入">{order.actualIncome}</Description>
            <Description term="下单时间">{order.appointment}</Description>
            <Description term="下单人">{order.orderName}</Description>
            <Description term="手机号">{order.orderMobile}</Description>
            <Description term="订单状态">
              {order.orderStatus && (
                <Badge
                  status={orderStatusMap[order.orderStatus].style}
                  text={orderStatusMap[order.orderStatus].text}
                />
              )}
            </Description>
            <Description term="揽件地址">
              {order.orderProvince
                ? `${order.orderProvince}${order.orderCity}${order.orderRegion}${
                    order.orderAddress
                  }`
                : ''}
            </Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 32 }} />
          <div className={styles.title}>订单商品</div>
          <List
            size="large"
            rowKey="id"
            loading={loading}
            pagination={false}
            dataSource={order.bookInfos}
            renderItem={(item, index) => (
              <List.Item
                className="custom-list-item"
                actions={[
                  <a onClick={this.handlePrint}>打印条码</a>,
                  <MoreBtn current={item} index={index} onClick={this.handleBookItem} />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.smallIcon} shape="square" size={100} />}
                  title={item.name}
                  description={<ListItemDesc {...item} />}
                />
              </List.Item>
            )}
          />
        </Card>
        <RejectForm {...parentMethods} isDeny={isDeny} visible={modalVisible} />
        <UpdateForm data={selectRow} {...updateMethods} visible={updateModalVisible} />
      </PageHeaderWrapper>
    );
  }
}

export default RecycleDetail;