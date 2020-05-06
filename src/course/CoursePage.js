import React, { useEffect, useState } from 'react';
import { Button, PageHeader, Tag } from 'antd';
import { apiGet } from '../apiBase';
import { formatCourseName } from '../format';
import {xbr2x, xbr3x} from 'xbr-js';

import {GlobalOutlined} from '@ant-design/icons';

function convertUriToImageData(URI) {
  return new Promise(function(resolve, reject) {
    if (URI == null) return reject();
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d'),
        image = new Image();
    image.addEventListener('load', function() {
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
    return imageUrl;
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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [catalogUrl, setCatalogUrl] = useState('');
  const [profileIcon, setProfileIcon] = useState('');
  useEffect(() => {
    apiGet(`/university/${universityCode}/course/${courseCode}`, { auth: false }).then(c => setCourse(c));
    apiGet(`/university/${universityCode}/course/${courseCode}/metadata`, {auth: false}).then(({catalogUrl, websiteUrl, iconUrl}) => {
      setCatalogUrl(catalogUrl);
      setWebsiteUrl(websiteUrl);
      upscaledImageUrl(iconUrl).then(u => {
        setProfileIcon(u);
      });
    })
  }, [courseCode, universityCode]);
  const extra = [];
  if (websiteUrl) {
    extra.push(<Button key="website"><a target='_blank' rel="noopener noreferrer" href={websiteUrl}>Website</a></Button>)
  }
  if (catalogUrl) {
    extra.push(<Button key="info"><a target='_blank' rel="noopener noreferrer" href={catalogUrl}>Catalog</a></Button>)
  }
  extra.push(<Button key="rate" type="primary">Rate</Button>);
  return <>
    <PageHeader title={formatCourseName(courseCode, course.title)} className="site-page-header" tags={<Tag color="blue">Fall 2020</Tag>} extra={extra} avatar={{shape: 'square', ...(profileIcon ? {src: profileIcon} : {icon: <GlobalOutlined />}) }} breadcrumb={{
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
