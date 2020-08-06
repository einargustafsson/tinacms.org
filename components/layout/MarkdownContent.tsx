import React, { useRef } from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import CodeStyle from '../styles/Code'

import LinkSvg from '../../public/svg/link.svg'
import styled from 'styled-components'

import * as shortcodeRenderers from 'utils/shortcodes'

var GithubSlugger = require('github-slugger')
const shortcodes = require('remark-shortcodes')

interface MarkdownContentProps {
  content: string
  escapeHtml?: boolean // eq:false --> if the component needs to render html
  skipHtml?: boolean
}

function WithCodeStyles({ language: tags = '', value }) {
  const [language, ...other] = tags.split(',')
  const copy = other.includes('copy') || language === 'copy'
  console.log(value)
  return (
    <>
      <SyntaxHighlighter language={language} style={CodeStyle}>
        {value}
      </SyntaxHighlighter>
      {copy ? <CopyCodeButton value={value} /> : null}
    </>
  )
}

const copyToClipboard = (text: string) => {
  const el = document.createElement('textarea')
  el.value = text
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

interface copyButtonProps {
  value?: string
}

const CopyCodeButton = ({ value }: copyButtonProps) => {
  const clickEvent = () => {
    copyToClipboard(value)
  }

  return <button onClick={clickEvent}>Copy</button>
}

function WithHeadings({ children, level }) {
  const HeadingTag = `h${level}` as any
  const value = children
    .map(child => child.props.value || child.props.children[0].props.value)
    .join('')
  var slugger = new GithubSlugger()
  const slug = slugger.slug(value)

  return (
    <HeadingTag id={slug}>
      <HeadingLink href={`#${slug}`} aria-label={value} className="anchor">
        <LinkSvg />
      </HeadingLink>
      {children}
    </HeadingTag>
  )
}

const HeadingLink = styled.a`
  fill: var(--color-secondary);
  opacity: 0;
  display: flex;
  align-items: center;
  position: absolute;
  top: 1rem;
  left: -0.25rem;
  height: 1.3em;
  transform: translate3d(-100%, 0, 0);
  transition: all 180ms ease-out;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  &:hover,
  &:focus,
  *:hover > & {
    opacity: 1;
  }
`

// https://github.com/rexxars/react-markdown/issues/113#issuecomment-490060741
const ShortcodeRenderer = ({ identifier, attributes }) => {
  const Renderer = shortcodeRenderers[identifier]

  if (!Renderer) {
    console.warn(`No renderer for shortcode: ${identifier}`)
    return null
  }

  return <Renderer {...attributes} />
}

export function MarkdownContent({
  content,
  escapeHtml,
  skipHtml,
}: MarkdownContentProps) {
  return (
    <ReactMarkdown
      escapeHtml={escapeHtml === false ? escapeHtml : true}
      skipHtml={skipHtml ? skipHtml : false}
      source={content}
      renderers={{
        code: WithCodeStyles,
        heading: WithHeadings,
        shortcode: ShortcodeRenderer,
      }}
      plugins={[[shortcodes, { startBlock: '{{', endBlock: '}}' }]]}
    />
  )
}

MarkdownContent.defaultProps = {
  escapeHtml: true,
  skipHtml: false,
}
