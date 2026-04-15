import request from '@/utils/requests'

// 获取验证码
export function getCode(email) {
  return request({
    url: '/reg/get-code',
    method: 'post',
    data: {
      email
    }
  })
}

// 添加广告
export function register(data) {
  return request({
    url: '/reg/register',
    method: 'post',
    data
  })
}
