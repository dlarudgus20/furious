import { useState } from 'react'
import { Grid, Divider, IconButton, Typography, Collapse } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { ExpandLess, ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => createStyles({
  divider: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
}))

function Paragraph(props: { title: string, className?: any, children?: any, fixed?: boolean }) {
  const classes = useStyles()
  const [open, setOpen] = useState(true)

  return (
    <div className={props.className}>
      <Grid container justify='space-between'>
        <Grid item>
          <Typography variant='h5' gutterBottom>
            {props.title}
          </Typography>
        </Grid>
        <Grid item>
          {!props.fixed && (
            <IconButton onClick={() => setOpen(!open)}>
              {open ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Grid>
      </Grid>
      <div className={classes.divider}>
        <Divider />
      </div>
      <Collapse in={open} timeout='auto' unmountOnExit>
        {props.children}
      </Collapse>
    </div>
  )
}

export default Paragraph
