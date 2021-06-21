import React from 'react'
import { AppBar, Toolbar, IconButton, Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { Menu as MenuIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => createStyles({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}))

function Layout(props: any) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position='static'>
        <Toolbar>
          <IconButton className={classes.menuButton} edge='start' color='inherit' aria-label='menu'>
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant='h6'>
            Furui
          </Typography>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        {props.children}
      </main>
    </div>
  )
}

export default Layout
