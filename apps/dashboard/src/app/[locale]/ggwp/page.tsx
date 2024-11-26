import { getUser } from '@midday/supabase/cached-queries';
import { createClient } from '@midday/supabase/server';
import React, { useEffect } from 'react'

const page = async() => {

  const client  = createClient()


//  const data = await client.from("skill").insert({name: "test"})
  const  data  = await getUser();

  const {
    data: { session },
  } = await client.auth.getSession();
  console.log(session)
  return (
    <div>paasdasdasdasdge</div>
  )
}

export default page