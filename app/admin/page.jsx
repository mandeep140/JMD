import React from 'react'
import { redirect } from 'next/navigation'

const page = () => {
  redirect('/admin/dashboard');
  return (
    <div>page</div>
  )
}

export default page