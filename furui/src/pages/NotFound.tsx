import React from 'react'
import { Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'

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
