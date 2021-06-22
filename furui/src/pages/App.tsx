import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useAuth } from '../contexts/Auth'
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

  useEffect(() => {
    if (auth.initialized && !auth.userInfo) {
      history.replace('/signin')
    }
  }, [auth])

  function possesive(str?: string) {
    if (!str) {
      return ''
    } else if (str[str.length - 1] === 's') {
      return str + "'"
    } else {
      return str + "'s"
    }
  }

  if (!auth.userInfo) {
    return <Typography>Loading...</Typography>
  }

  return (
    <div>
      <div className={classes.item}>
        <Typography variant='h3' gutterBottom>
          {possesive(auth.userInfo?.name)} workspace
        </Typography>
      </div>
      <div className={classes.item}>
        <DeviceList />
      </div>
    </div>
  )
}

export default AppPage
