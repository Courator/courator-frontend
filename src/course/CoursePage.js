import React, { useEffect, useState, useRef } from 'react';
import { Button, PageHeader, Tag, Modal, Rate, AutoComplete, Tooltip, Form, InputNumber, Input, message, Card } from 'antd';
import { apiGet, apiPost } from '../apiBase';
import { formatCourseName, cardShadow } from '../format';
import { xbr2x, xbr3x } from 'xbr-js';
import { uuidv4, capitalize } from '../util';

import { GlobalOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';

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
  console.log('Modal form:', initialName, visible);
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
      <Form form={form} layout="horizontal" name="newRatingAttrForm" {...formItemLayout} initialValues={{name: initialName}}>
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
  const [descriptions, setDescriptions] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([
    { name: 'Difficulty', description: 'How hard you found the course', id: 1 },
    { name: 'Curriculum', description: 'How well the course was layed out', id: 2 },
    { name: 'Usefulness', description: 'How applicable the course is to the real world', id: 3 }
  ]);
  const [availableAttributes, setAvailableAttributes] = useState([
    { name: 'Fun', description: 'How fun the class was', id: 15 },
    { name: 'Tedious', description: 'How tedious the class was', id: 16 },
    { name: 'Time Consuming', description: 'Amount of time required for class', id: 17 },
    { name: 'Rewarding', description: 'How rewarding the class was', id: 18 },
  ])
  const [searchVal, setSearchVal] = useState('');
  const [form] = Form.useForm();
  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
    apiGet(`/university/${universityCode}/course/${courseCode}/metadata`, { auth: false }).then(({ catalogUrl, websiteUrl, iconUrl }) => {
      setMetadata({ catalogUrl, websiteUrl, iconUrl })
      upscaledImageUrl(iconUrl).then(iconUrl => {
        setMetadata(m => ({ ...m, iconUrl }));
      }).catch(() => { });
    })
    apiGet(`/university/${universityCode}/course/${courseCode}/rating`, { auth: false }).then(ratings => {
      setDescriptions(ratings);
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
    <Button key="rate" type="primary" onClick={() => setRateVisible(true)}>Rate</Button>
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
            console.log('SUBMIT:', values, selectedAttributes);
            let newRatingAttributes = [];
            let ratings = [];
            Object.keys(values).forEach(k => {
              let v = values[k];
              if (v !== undefined && v !== 0) {
                let prefix = 'rating:';
                if (k.startsWith(prefix)) {
                  let ratingId = prefix.slice(prefix.length);
                  let matches = selectedAttributes.filter(x => x.id === ratingId);
                  if (matches.length > 0 && matches[0].generated) {
                    const {name, description, id} = matches[0];
                    newRatingAttributes.push({name, description, id});
                  }
                  ratings.push({id: ratingId, value: v});
                }
              }
            })
            let overallRating = values.overall;
            let description = values.description;
            let data = {
              ratings, overallRating, description, newRatingAttributes
            };
            console.log('SUBMIT:', data);
            apiPost(`/university/${universityCode}/course/${courseCode}/rating`, data).then(r => {
              console.log('Submitted');
              setRateVisible(false);
              message.info('Submitted rating.');
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
            {rateAddAttrVisible ? <ModalForm visible={rateAddAttrVisible} onCancel={() => setRateAddAttrVisible(false)} initialName={rateAddAttrName}/> : <></>}
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
              }}/>
              </AutoComplete>
          </div>
          <Form.Item
              name="description"
              label={null}
              style={{paddingTop: 25}}
            >
              <Input.TextArea placeholder='Description'/>
            </Form.Item>
        </Form>
      </Form.Provider>
    </Modal>
  </div>);
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
      <div style={{padding: 20}}>{descriptions.map(desc => <><Card style={{...cardShadow}}><p>{desc}</p></Card> <br/><br/></>)}</div>
    </PageHeader>
  </>;
}
