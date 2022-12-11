import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Typography, Button, MenuItem, Select, FormControl } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { Menu as MenuIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/Auth'
import { useTheme } from '../contexts/Theme'
import MyLocales, { SupportedLocales } from '../locales'

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
  lowerButton: {
    textTransform: 'none',
  },
  localeSelect: {
    color: 'white',
  },
  localeSelectIcon: {
    fill: 'white',
  },
}))

function Layout(props: any) {
  const classes = useStyles()
  const history = useHistory()
  const auth = useAuth()
  const theme = useTheme()

  return (
    <div className={classes.root}>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            edge='start'
            color='inherit'
            aria-label='menu'
            size="large">
            <MenuIcon />
          </IconButton>
          <div className={classes.title}>
            <Button className={classes.lowerButton} color='inherit' onClick={() => history.push('/')}>
              <Typography variant='h6'>
                Furui
              </Typography>
            </Button>
          </div>
          <FormControl className={classes.menuButton} variant='standard'>
            <Select
              className={classes.localeSelect}
              inputProps={{
                classes: {
                  icon: classes.localeSelectIcon,
                },
              }}
              value={theme.locale}
              disableUnderline
              onChange={e => {
                theme.setLocale(e.target.value as SupportedLocales)
              }}
            >
              {Object.keys(MyLocales).map(locale => (
                <MenuItem
                  key={`locale-select-${locale}`}
                  value={locale}
                >
                  {locale}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button className={classes.lowerButton} color='inherit' onClick={() => history.push('/signin')}>
            {auth.userInfo ? auth.userInfo.name : 'Sign in'}
          </Button>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        {props.children}
      </main>
    </div>
  )
}

export default Layout
