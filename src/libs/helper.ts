export const delay = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout))

export function readFile(file: File, type: 'text' | 'buffer' = 'text'): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (readerEvent: any) => {
      resolve(readerEvent.target.result)
    }
    if (type === 'buffer') {
      reader.readAsArrayBuffer(file)
    } else {
      reader.readAsText(file, 'UTF-8')
    }
  })
}

export const selectFile = (options = { asText: false, accept: 'video/*,image/*' }): Promise<File | string> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = options.accept
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (options.asText) {
        resolve(await readFile(file))
      } else {
        resolve(file)
      }
    }
    input.click()
  })
}

export function image2base64(imgURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      const reader = new FileReader()
      reader.onloadend = function () {
        resolve((reader.result as string).replace(/data:.*;base64,/, ''))
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.open('GET', imgURL)
    xhr.responseType = 'blob'
    xhr.send()
  })
}

export const file2base64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve((reader.result as string).replace(/data:.*;base64,/, ''))
  reader.onerror = error => reject(error)
})

export const fileType = (filename: string): 'video' | 'image' | 'unknow' => {
  filename = filename.replace(/\?.*/, '')
  if (['mp4', 'flv', 'mov'].find(item => filename.endsWith(item))) {
    return 'video'
  }
  if (['jpg', 'png', 'gif', 'jpeg'].find(item => filename.endsWith(item))) {
    return 'image'
  }
  return 'unknow'
}
