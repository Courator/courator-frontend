import React, { useEffect, useState } from 'react';
import { Button, PageHeader, Tag, Modal, Rate, AutoComplete } from 'antd';
import { apiGet } from '../apiBase';
import { formatCourseName } from '../format';
import { xbr2x, xbr3x } from 'xbr-js';

import { GlobalOutlined, CloseOutlined } from '@ant-design/icons';

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

export function CoursePage({ universityCode, courseCode }) {
  const [course, setCourse] = useState({});
  const [metadata, setMetadata] = useState({});
  const [rateVisible, setRateVisible] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([{name: 'Difficulty', id: 1}, {name: 'Curriculum', id: 2}, {name: 'Usefulness', id: 3}]);
  const [availableAttributes, setAvailableAttributes] = useState([
    { name: 'Fun', id: 15},
    { name: 'Tedious', id: 16},
    { name: 'Time Consuming', id: 17},
    { name: 'Rewarding', id: 18 },
  ])
  const [searchVal, setSearchVal] = useState('');
  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
    apiGet(`/university/${universityCode}/course/${courseCode}/metadata`, { auth: false }).then(({ catalogUrl, websiteUrl, iconUrl }) => {
      setMetadata({catalogUrl, websiteUrl, iconUrl})
      upscaledImageUrl(iconUrl).then(iconUrl => {
        setMetadata(m => ({...m, iconUrl}));
      }).catch(() => {});
    })
  }, [courseCode, universityCode]);
  const extra = [];
  if (metadata.websiteUrl) {
    extra.push(<Button key="website"><a target='_blank' rel="noopener noreferrer" href={metadata.websiteUrl}>Website</a></Button>)
  }
  if (metadata.catalogUrl) {
    extra.push(<Button key="info"><a target='_blank' rel="noopener noreferrer" href={metadata.catalogUrl}>More Info</a></Button>)
  }
  extra.push(<>
    <Button key="rate" type="primary" onClick={() => setRateVisible(true)}>Rate</Button>
    <Modal
      title={null}
      visible={rateVisible}
      maskClosable={false}
      onOk={() => setRateVisible(false)}
      onCancel={() => setRateVisible(false)}
      style={{textAlign: 'center'}}
    >
      <h1>{`Rate ${formatCourseName(courseCode, course.title)}`}</h1>
      <div style={{fontSize: 35, display: 'inline-block', paddingBottom: 10}}>
        <Rate style={{fontSize: 35}}/>
      </div>
      <table style={{textAlign: 'right', margin: '0 auto'}}>
      {selectedAttributes.map(ratingAttribute => {
        return <tr key={ratingAttribute.id} style={{height: '35px'}}><td style={{paddingRight: '5px'}}>{ratingAttribute.name}:</td><td style={{height: '35px'}}><Rate style={{height: '35px'}}/></td><td style={{ display: 'inline-flex', paddingLeft: 10, justifyContent: 'center', alignItems: 'center', height: '35px'}}>
          <Button type='dashed' icon={<CloseOutlined />} onClick={() => {
            setSelectedAttributes(attributes => attributes.filter(x => x.id !== ratingAttribute.id));
            setAvailableAttributes(attributes => [...attributes, ratingAttribute]);
          }}/>
          </td></tr>
      })}
      </table><br/>
      <div style={{margin: '0 auto', width: 200}}>
      <AutoComplete style={{
          width: 200
        }} value={searchVal} options={availableAttributes.map(x => ({value: x.name, ...x}))} onSelect={(value, option) => {
          setAvailableAttributes(attributes => attributes.filter(x => x.id !== option.id));
          setSelectedAttributes(attributes => [...attributes, {name: option.value, id: option.id}]);
          setSearchVal('');
        }} onChange={v => {
          setSearchVal(v);
        }}/>
        </div>
    </Modal>
  </>);
  return <>
    <PageHeader title={formatCourseName(courseCode, course.title)} className="site-page-header" tags={<Tag color="blue">Fall 2020</Tag>} extra={extra} avatar={{ shape: 'square', ...(metadata.iconUrl ? { src: metadata.iconUrl } : { icon: <GlobalOutlined /> }) }} breadcrumb={{
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
    </PageHeader>
  </>;
}
