import React, { useEffect, useState, useRef } from 'react';
import { Button, PageHeader, Tag, Modal, Rate, AutoComplete, Tooltip, Form, Input, message, Card, Row, Col, Badge } from 'antd';
import { apiGet, apiPost } from '../apiBase';
import { formatCourseName, cardShadow } from '../format';
import { xbr2x, xbr3x } from 'xbr-js';
import { uuidv4, capitalize } from '../util';

import { GlobalOutlined, CloseOutlined } from '@ant-design/icons';
import { isLoggedIn } from '../api';

function convertUriToImageData(URI) {
  return new Promise(function (resolve, reject) {
    if (URI == null) return reject();
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      image = new Image();
    image.addEventListener('load', function () {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context.getImageData(0, 0, canvas.width, canvas.height));
    }, false);
    image.src = URI;
  });
}

function imageDataToDataUrl(imagedata) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);
  return canvas.toDataURL();
}

async function upscaledImageUrl(imageUrl) {
  const d = await convertUriToImageData(imageUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let scale = 1;
  let scaler = undefined;
  const minDim = Math.min(d.width, d.height);
  if (minDim <= 12) {
    scale = 3;
    scaler = xbr3x;
  } else if (minDim <= 16) {
    scale = 2;
    scaler = xbr2x;
  }
  if (scaler === undefined) {
    throw Error('Already upscaled');
  }

  canvas.width = d.width * scale;
  canvas.height = d.height * scale;
  const originalPixelView = new Uint32Array(d.data.buffer);
  const scaledPixelView = scaler(originalPixelView, d.width, d.height);
  const scaledImageData = context.createImageData(canvas.width, canvas.height);
  scaledImageData.data.set(new Uint8ClampedArray(scaledPixelView.buffer));
  const dataUrl = imageDataToDataUrl(scaledImageData);
  return dataUrl;
}

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, visible }) => {
  const prevVisibleRef = useRef();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;
  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible, prevVisible, form]);
};

const ModalForm = ({ visible, onCancel, initialName }) => {
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };
  useResetFormOnCloseModal({
    form,
    visible,
  });

  return (
    <Modal
      destroyOnClose={true}
      title='Add rating attribute'
      visible={visible}
      maskClosable={false}
      onOk={() => form.submit()}
      onCancel={onCancel}
      width={400}
      style={{ textAlign: 'center', top: 184 }}
    >
      <Form form={form} layout="horizontal" name="newRatingAttrForm" {...formItemLayout} initialValues={{ name: capitalize(initialName) }}>
        <Form.Item
          name="name"
          label="Name"
          normalize={capitalize}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          normalize={capitalize}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export function CoursePage({ universityCode, courseCode }) {
  const [course, setCourse] = useState({});
  const [metadata, setMetadata] = useState({});
  const [rateVisible, setRateVisible] = useState(false);
  const [rateAddAttrVisible, setRateAddAttrVisible] = useState(false);
  const [rateAddAttrName, setRateAddAttrName] = useState('');
  const [ratings, setRatings] = useState({ reviews: [], attributes: [] });
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [availableAttributes, setAvailableAttributes] = useState([])
  const [allAttributes, setAllAttributes] = useState([]);
  const [searchVal, setSearchVal] = useState('');
  const [form] = Form.useForm();
  const rateAttrInfo = {};

  console.log('SRC:', ratings.attributes)
  allAttributes.forEach(x => {
    rateAttrInfo[x.id] = x;
  });

  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
    apiGet(`/university/${universityCode}/course/${courseCode}/metadata`, { auth: false }).then(({ catalogUrl, websiteUrl, iconUrl }) => {
      setMetadata({ catalogUrl, websiteUrl, iconUrl })
      upscaledImageUrl(iconUrl).then(iconUrl => {
        setMetadata(m => ({ ...m, iconUrl }));
      }).catch(() => { });
    })
    apiGet(`/university/${universityCode}/course/${courseCode}/rating`, { auth: false }).then(ratings => {
      setRatings(ratings);
    });
    apiGet(`/ratingAttribute`, { auth: false }).then(attributes => {
      setAllAttributes(attributes);
      const editableAttributes = attributes.filter(x => !x.name.startsWith('_'));
      setSelectedAttributes(editableAttributes.splice(0, 4));
      setAvailableAttributes(editableAttributes);
    });
  }, [courseCode, universityCode]);
  const extra = [];
  if (metadata.websiteUrl) {
    extra.push(<Button key="website"><a target='_blank' rel="noopener noreferrer" href={metadata.websiteUrl}>Website</a></Button>)
  }
  if (metadata.catalogUrl) {
    extra.push(<Button key="info"><a target='_blank' rel="noopener noreferrer" href={metadata.catalogUrl}>More Info</a></Button>)
  }
  extra.push(<div key="extra" style={{ display: 'inline-block' }}>
    <Tooltip title='Log in to rate' trigger={isLoggedIn() ? [] : ['hover']}><Button key="rate" type="primary" disabled={!isLoggedIn()} onClick={() => setRateVisible(true)}>Rate</Button></Tooltip>
    <Modal
      title={null}
      visible={rateVisible}
      maskClosable={false}
      destroyOnClose={true}
      onOk={() => form.submit()}
      onCancel={() => setRateVisible(false)}
      style={{ textAlign: 'center' }}
    >
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === 'ratingForm') {
            console.log('BEFORE:', values, selectedAttributes);
            let newRatingAttributes = [];
            let ratings = [];
            Object.keys(values).forEach(k => {
              let v = values[k];
              if (v !== undefined && v !== 0) {
                let prefix = 'rating:';
                if (k.startsWith(prefix)) {
                  let ratingId = k.slice(prefix.length);
                  let matches = selectedAttributes.filter(x => x.id === ratingId);
                  if (matches.length > 0 && matches[0].generated) {
                    const { name, description, id } = matches[0];
                    newRatingAttributes.push({ name, description, id });
                  }
                  ratings.push({ id: ratingId, value: v });
                }
              }
            })
            let overallRating = values.overall;
            let description = values.description || '';
            let data = {
              ratings, overallRating, description, newRatingAttributes
            };
            console.log('SUBMIT:', data);
            apiPost(`/university/${universityCode}/course/${courseCode}/rating`, data).then(r => {
              console.log('Submitted');
              setRateVisible(false);
              message.info('Submitted rating.');
            }).catch(r => {
              if (r.status === 409) {
                message.error('Course already rated.');
                setRateVisible(false);
              } else {
                throw r;
              }
            })
          } else if (name === 'newRatingAttrForm') {
            console.log('New rating:', values);
            setSelectedAttributes(attrs => [...attrs, { ...values, id: uuidv4(), generated: true }]);
            setRateAddAttrVisible(false);
          }
        }}
      >
        <Form form={form} name="ratingForm" onFinish={x => { console.log('FORM A:', x); }}>
          <h1>{`Rate ${formatCourseName(courseCode, course.title)}`}</h1>
          <div style={{ fontSize: 35, display: 'inline-block', paddingBottom: 10 }}>
            <Form.Item
              name="overall"
              label={null}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Rate style={{ fontSize: 35 }} />
            </Form.Item>
          </div>
          <table style={{ textAlign: 'right', margin: '0 auto' }}>
            <tbody>

              {selectedAttributes.map(ratingAttribute => {
                return <Tooltip placement='left' title={ratingAttribute.description} key={ratingAttribute.id} ><tr style={{ height: '35px' }}>
                  <td style={{ paddingRight: '5px' }}>{ratingAttribute.name}:</td>
                  <td style={{ height: '35px' }}>
                    <Form.Item
                      label={null}
                      name={`rating:${ratingAttribute.id}`}
                      shouldUpdate={(prevValues, curValues) => prevValues.attributes !== curValues.attributes}
                      style={{ height: '35px', padding: 0, margin: 0 }}
                    >
                      <Rate style={{ height: '35px' }} />
                    </Form.Item>
                  </td>
                  <td style={{ display: 'inline-flex', paddingLeft: 10, justifyContent: 'center', alignItems: 'center', height: '35px' }}>
                    <Button type='dashed' icon={<CloseOutlined />} onClick={() => {
                      form.setFieldsValue({ [`rating:${ratingAttribute.id}`]: undefined });
                      setSelectedAttributes(attrs => attrs.filter(x => x.id !== ratingAttribute.id));
                      setAvailableAttributes(attrs => [...attrs, ratingAttribute]);
                    }} />
                  </td></tr></Tooltip>
              })}
            </tbody>
          </table><br />
          <div style={{ margin: '0 auto', width: 200 }}>
            {rateAddAttrVisible ? <ModalForm visible={rateAddAttrVisible} onCancel={() => setRateAddAttrVisible(false)} initialName={rateAddAttrName} /> : <></>}
            <AutoComplete placeholder='Find rating attribute' style={{
              width: 200
            }}
              value={searchVal}
              options={availableAttributes.map(x => ({ value: x.name, ...x }))}
              onSelect={(value, option) => {
                setAvailableAttributes(attributes => attributes.filter(x => x.id !== option.id));
                setSelectedAttributes(attrs => [...attrs, { name: option.value, id: option.id }]);
                setSearchVal('');
              }}
              filterOption={(inputValue, option) =>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              onChange={v => {
                setSearchVal(v);
              }}>
              <Input allowClear onPressEnter={e => {
                e.preventDefault();
                setRateAddAttrName(e.target.value);
                setRateAddAttrVisible(true);
                setSearchVal('');
              }} />
            </AutoComplete>
          </div>
          <Form.Item
            name="description"
            label={null}
            style={{ paddingTop: 25 }}
          >
            <Input.TextArea placeholder='Description' />
          </Form.Item>
        </Form>
      </Form.Provider>
    </Modal>
  </div>);
  const overallID = (allAttributes.filter(x => x.name === '_Overall')[0] || {}).id;

  const overall = ratings.attributes.filter(x => x.attributeID === overallID)[0];
  const others = ratings.attributes.filter(x => x.attributeID !== overallID);
  console.log('OTHERS:', others);

  return <>
    <PageHeader title={formatCourseName(courseCode, course.title)} className="site-page-header" tags={<Tag color="blue">Fall 2020</Tag>} extra={extra}
      avatar={{ shape: 'square', ...(metadata.iconUrl ? { src: metadata.iconUrl } : { icon: <GlobalOutlined /> }) }} breadcrumb={{
        routes: [
          {
            path: '/university',
            breadcrumbName: 'Universities',
          },
          {
            path: '/' + universityCode,
            breadcrumbName: universityCode,
          },
          {
            path: '/course',
            breadcrumbName: 'Courses',
          },
          {
            path: '/' + courseCode,
            breadcrumbName: courseCode,
          }
        ]
      }}>
      {course.description}

      {overall ? <>
        <Row justify="center" style={{ paddingBottom: 20, paddingTop: 20, textAlign: 'center', fontSize: 20 }}><Col>
        <Badge style={{
                  backgroundColor: '#fff',
                  color: '#999',
                  boxShadow: '0 0 0 1px #d9d9d9 inset'
                }} count={overall.count}>Overall&nbsp;&nbsp;&nbsp;</Badge><br />
          <Rate disabled value={5 * overall.average} style={{ fontSize: 25 }} />
        </Col></Row>
        <Row justify="center" style={{ paddingBottom: 20, paddingTop: 20 }}><Col lg={12} sm={24}>
          <Row>{others.map(x => {
            const attr = rateAttrInfo[x.attributeID];
            if (attr === undefined) {
              return <div key={x.attributeID}></div>;
            }
            return <Col key={x.attributeID} sm={24} lg={8} style={{ fontSize: 15, textAlign: 'center' }}>
              <Tooltip title={attr.description} style={{ paddingRight: 10, fontSize: 16 }}>
                <Badge style={{
                  backgroundColor: '#fff',
                  color: '#999',
                  boxShadow: '0 0 0 1px #d9d9d9 inset'
                }} count={x.count}>{attr.name}&nbsp;&nbsp;&nbsp;</Badge>
              </Tooltip><br />
              <Rate disabled value={5 * x.average} />
            </Col>;
          })}</Row>
        </Col></Row>

      </>
        : <></>}



      <div style={{ padding: 20 }}>
        {ratings.reviews.map((review, i) => <div key={i}>
          <Card  style={{ ...cardShadow }} title={review.account.name || review.account.email}>
            <Row>
              <Col sm={24} lg={12}><p>{review.description}</p></Col>
              <Col sm={24} lg={12}><Row>{review.ratings.map(rating => {
                console.log(rateAttrInfo, rating);
                const attr = rateAttrInfo[rating.attributeID];
                if (attr === undefined) {
                  return <div key={rating.attributeID}></div>
                }
                return <Col key={rating.attributeID} sm={8}><Tooltip title={attr.description}>{attr.name.replace('_Overall', 'Overall')}</Tooltip><Rate disabled value={5 * rating.value} /></Col>;
              })}</Row></Col>
            </Row>
          </Card>
          <br />
          <br />
        </div>)}</div>
    </PageHeader>
  </>;
}
