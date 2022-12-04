import React from 'react'
import { Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

function NotFoundPage() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant='h5'>
        404 Not Found
      </Typography>
    </div>
  )
}

export default NotFoundPage
