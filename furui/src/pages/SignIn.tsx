import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Checkbox, Divider, FormControlLabel, Grid, Paper, TextField, Typography } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { useAuth } from '../contexts/Auth'

const useStyles = makeStyles(theme => createStyles({
  form: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  formItem: {
    marginBottom: theme.spacing(0.5),
  }
}))

function SignInPage() {
  const classes = useStyles()
  const history = useHistory()
  const auth = useAuth()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [signUp, setSignUp] = useState(false)

  const [newName, setNewName] = useState('')

  async function handleSignIn() {
    if (email === '') {
      alert('Email is empty')
    } else if (password === '') {
      alert('Password is empty')
    } else if (await auth.signIn(email, password)) {
      history.push('/')
    } else {
      alert('Email or Password is incorrect')
    }
  }

  async function handleSignUp() {
    if (email === '') {
      alert('Email is empty')
    } else if (password === '') {
      alert('Password is empty')
    } else if (name === '') {
      alert('Name is empty')
    } else if (password !== password2) {
      alert('Password is not equal to confirm password')
    } else if (await auth.signUp(email, password, name)) {
      history.push('/')
    } else {
      alert('Account Creation failed')
    }
  }

  async function handleChangeName() {
    if (newName === '') {
      alert('Name is empty')
    } else {
      try {
        await auth.changeName(newName)
        history.push('/')
      } catch (err) {
        alert(err)
      }
    }
  }

  return (
    <Grid container justify='space-around'>
      <Grid xs={12} sm={6} md={3} item>
        <Paper className={classes.form}>
          <Typography variant='h6' gutterBottom>
            {signUp ? 'Sign Up' : 'Sign In'}
          </Typography>
          <Divider />
          <TextField
            className={classes.formItem}
            label='Email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
          />
          {signUp && (
            <TextField
              className={classes.formItem}
              label='Name'
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
            />
          )}
          <TextField
            className={classes.formItem}
            label='Password'
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />
          {signUp && (
            <TextField
              className={classes.formItem}
              label='Confirm Password'
              type='password'
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              fullWidth
            />
          )}
          <FormControlLabel
            className={classes.formItem}
            checked={signUp}
            label='Sign Up'
            onChange={e => setSignUp(!signUp)}
            control={<Checkbox />}
          />
          <Button
            color='primary'
            variant='contained'
            fullWidth
            onClick={() => signUp ? handleSignUp() : handleSignIn()}
          >
            {signUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </Paper>
        {auth.userInfo && (
          <Paper className={classes.form}>
            <Typography variant='h6' gutterBottom>
              Change User Name
            </Typography>
            <Divider />
            <TextField
              className={classes.formItem}
              label='New Name'
              type='text'
              value={newName}
              onChange={e => setNewName(e.target.value)}
              fullWidth
            />
            <Button
              color='primary'
              variant='contained'
              fullWidth
              onClick={() => handleChangeName()}
            >
              Change Name
            </Button>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

export default SignInPage
