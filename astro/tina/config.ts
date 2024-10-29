import { defineConfig } from 'tinacms'

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: '',
      publicFolder: 'src/images',
    },
  },
  schema: {
    collections: [
      {
        name: 'docs',
        label: 'Documentation',
        path: 'src/content/docs',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
          },
          {
            type: 'object',
            name: 'sidebar',
            label: 'Sidebar Configuration',
            fields: [
              {
                type: 'string',
                name: 'label',
                label: 'Sidebar Label',
              },
              {
                type: 'number',
                name: 'order',
                label: 'Sidebar Order',
              },
            ],
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'Aside',
                label: 'Aside Note',
                fields: [
                  {
                    type: 'string',
                    name: 'type',
                    label: 'Type',
                    options: ['note', 'tip', 'caution', 'danger'],
                  },
                  {
                    type: 'rich-text',
                    name: 'children',
                    label: 'Content',
                  },
                ],
              },
              {
                name: 'Tabs',
                label: 'Tabs Container',
                fields: [
                  {
                    type: 'object',
                    name: 'children',
                    label: 'Tab Items',
                    list: true,
                    fields: [
                      {
                        type: 'string',
                        name: 'label',
                        label: 'Tab Label',
                      },
                      {
                        type: 'rich-text',
                        name: 'content',
                        label: 'Tab Content',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'CardGrid',
                label: 'Card Grid',
                fields: [
                  {
                    type: 'object',
                    name: 'children',
                    label: 'Cards',
                    list: true,
                    fields: [
                      {
                        type: 'string',
                        name: 'title',
                        label: 'Card Title',
                      },
                      {
                        type: 'string',
                        name: 'icon',
                        label: 'Card Icon',
                      },
                      {
                        type: 'rich-text',
                        name: 'content',
                        label: 'Card Content',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'LinkCard',
                label: 'Link Card',
                fields: [
                  {
                    type: 'string',
                    name: 'title',
                    label: 'Link Title',
                  },
                  {
                    type: 'string',
                    name: 'href',
                    label: 'Link URL',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'post',
        label: 'Blog Posts',
        path: 'src/content/blog',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
          },
          {
            type: 'string',
            name: 'author',
            label: 'Author',
            required: true,
          },
          {
            type: 'image',
            name: 'authorImage',
            label: 'Author Image',
            required: true,
          },
          {
            type: 'string',
            name: 'authorImageAlt',
            label: 'Author Image Alt Text',
            required: true,
          },
          {
            type: 'datetime',
            name: 'pubDate',
            label: 'Publication Date',
            required: true,
          },
          {
            type: 'image',
            name: 'cardImage',
            label: 'Card Image',
            required: true,
          },
          {
            type: 'string',
            name: 'cardImageAlt',
            label: 'Card Image Alt Text',
            required: true,
          },
          {
            type: 'number',
            name: 'readTime',
            label: 'Read Time (minutes)',
            required: true,
          },
          {
            type: 'string',
            name: 'tags',
            label: 'Tags',
            list: true,
            required: true,
          },
          {
            type: 'string',
            name: 'contents',
            label: 'Contents',
            list: true,
            required: true,
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
      {
        name: 'insights',
        label: 'Insights',
        path: 'src/content/insights',
        format: 'md',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
          },
          {
            type: 'image',
            name: 'cardImage',
            label: 'Card Image',
            required: true,
          },
          {
            type: 'string',
            name: 'cardImageAlt',
            label: 'Card Image Alt Text',
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: [
              {
                name: 'Aside',
                label: 'Aside Note',
                fields: [
                  {
                    type: 'string',
                    name: 'type',
                    label: 'Type',
                    options: ['note', 'tip', 'caution', 'danger'],
                  },
                  {
                    type: 'rich-text',
                    name: 'children',
                    label: 'Content',
                  },
                ],
              },
              {
                name: 'Tabs',
                label: 'Tabs Container',
                fields: [
                  {
                    type: 'object',
                    name: 'children',
                    label: 'Tab Items',
                    list: true,
                    fields: [
                      {
                        type: 'string',
                        name: 'label',
                        label: 'Tab Label',
                      },
                      {
                        type: 'rich-text',
                        name: 'content',
                        label: 'Tab Content',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'CardGrid',
                label: 'Card Grid',
                fields: [
                  {
                    type: 'object',
                    name: 'children',
                    label: 'Cards',
                    list: true,
                    fields: [
                      {
                        type: 'string',
                        name: 'title',
                        label: 'Card Title',
                      },
                      {
                        type: 'string',
                        name: 'icon',
                        label: 'Card Icon',
                      },
                      {
                        type: 'rich-text',
                        name: 'content',
                        label: 'Card Content',
                      },
                    ],
                  },
                ],
              },
              {
                name: 'LinkCard',
                label: 'Link Card',
                fields: [
                  {
                    type: 'string',
                    name: 'title',
                    label: 'Link Title',
                  },
                  {
                    type: 'string',
                    name: 'href',
                    label: 'Link URL',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
})

