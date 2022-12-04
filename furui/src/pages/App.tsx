import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Typography } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useAuth } from '../contexts/Auth'
import { useTheme } from '../contexts/Theme'
import DeviceList from '../components/DeviceList'

const useStyles = makeStyles(theme => createStyles({
  item: {
    margin: theme.spacing(6)
  },
}))

function AppPage() {
  const classes = useStyles()
  const history = useHistory()
  const auth = useAuth()
  const theme = useTheme()

  const locale = theme.getLocalization()

  useEffect(() => {
    if (auth.initialized && !auth.userInfo) {
      history.replace('/signin')
    }
  }, [auth])

  if (!auth.userInfo) {
    return <Typography>Loading...</Typography>
  }

  return (
    <div>
      <div className={classes.item}>
        <Typography variant='h3' gutterBottom>
          {locale.possesive(auth.userInfo?.name)} workspace
        </Typography>
      </div>
      <div className={classes.item}>
        <DeviceList />
      </div>
    </div>
  )
}

export default AppPage
