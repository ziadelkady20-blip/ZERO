"use client";

const ZERO_MODEL_IMAGE = "data:image/webp;base64,UklGRrQ1AABXRUJQVlA4IKg1AAAwugGdASqAAhMDPsliq1EnpTI1olIZ4rAZCWdu++JSiLYU5wHegXVfaeKBOfanNKLKS4ILj42gw50N5Bnlz+Oc0s5Zsw4w+GB8GbXj8Z+wFxSP4j1Cv6b51enJ9GFYUqGyqGQcaZpLYhHumtLACm5FpqViFiptizqu4Qp3ttwugLhnbgihhoZ4404dTKhkHGnDqZUMgz2f6xb84wXtGqYcZMValEB4l2HRLjFm8jarHw6hjL92kAJCfFDqmGXAxFkz20IfJP6Z55d3zwOCYkroLGOfBSobKoY/Xnwiq1NcAOw52LrLoR3HXtQmOlsvSKp+KT0Y4Vlly9f4Bw5mNVFmK06UFBlCXhHMzaPUyoZBxpw6mVDIONMbkNlQCaXnnirg5ScXP28oTaiU3e2IWxIaNAEhIqmoe4tRq4RQ/zgPx8y1tpkao5Ph1wk9ITMB1MqGQcacOplQyDjTgEZTI+e6XxFD1D/NfJivGR0Kz9J9eZwb6ctO1Q/ylxqGPBWUMGiaiBw7oMrgmhSkPDRfA9TKhkHGnDqZUMQbfvxh9NpRk4bFbjleLxII+p0SpON7y7ldNMNnKj4v1idm80835eqHjP/iVVP/rrre2kQENoxdsGQcacOplQyDjTh1Mi7AumkCj6HUmckFsUjM4Rp4kJMvLNfi8N/9BLh5QyfJ1XU5wTDncwEgu0EYl61noN+ARanu2FKHIYFEjcWgiF808cacOplQyDjTh1Uui3EXGR+WHkk6QbDmhkAVYKe3WPPW6ySgeadSdHC+jzDKWKqgb5JzwRSlYnSA7c+PUyoZBxpw6mVDIONOHSwpOqmV/CADhCfNYkYNIs1Rp0NPmR0oocKmgUkUFVuSRvyRi/hGirV6GeSN1BjwVcpvx6mVDIONOHUyoZBxpw6ZjsoTc3ZMuv8+UGcq9wAUK7qBm39pOt7nXhJgRJNTGqUOMgKnC36WFGZwcacOplQyDjTh1MqGP56MjHiwfLEmOgPvaUK9q2sSIKHsd7JiZVU0c5EwZAKtDcg404dTKhkHGnDqZUMg4odeUFXmw3jOYfxE5kEnBQP389pCb8PirE14JaG68KDjzET611j32UBwUqGyqGQcacOplQyDjTK6Aln5mOljrAm/AO/KUyyIIEB+vOUyQ1MFYBOOy6L6INHSPQ1BwL+x6mVDIONOHUyoZBxpw6eKo5YDujmd7xvIpZ6lUom5iFNL0ZM54JsF00uGHW9oItlHTQgXLwNTJnWQ5EUlsUUmVzjGRUQUqGyqGQcacOplQxa55HK6lDNlo/HQSnX8ZbvNxtHYCVkL4pxC4/8sGRskdUKOZ/ubXx2DYTwcacOplQyDjTRdxE7jxccok6cbuPMER23unyc/J/uF67gB3lYgvbezIMO//sYklhbeYIuwJbpwvuUJ7/NPHGnDqZTfWLCxdv9hHOuXdtid4YrJk3PwJogQm1OHUyoZBxnPwQNN8zvWL2OF4IpSpSCLNPQ1/XNJScdwhqRpw6mVDEIJaa6xqLluW/pdPHexIjM6/zTxx4plmWThFq9foCjLxcZBxpw6mRfIjiVb+f5fpWeqpggKJFTWfo81PvWeZqEEASvMg1JegAciqItXtFNBItplrrCggguHawAtGEoFUPnNv3+aeONOB8bQ85sJLofM9zem1o4cyfNchJralHVCPI5uDIjvozL8idnRKKNKUyIm2GJJcr285tM2LdWJVK8jTUdzHmp/Iecqsu3M8KXyDZQjkov+fhDlSdeaL4HqZTQ53zHYIvYKbuqyKkvMZBe0cEI54cbNCEAa6NFxiTsZ7PpyD1FOJlDh+4Vrj+kM8XeH0+ee1zRDsPYbi+PEE4lvFwhZBxpw6mRGv5oIjTlOQAKqahGDWRLLX/ARA40awnoXxv6/KCqNZVtaBvKANPtZAQyLausMF0jytBRFxyaPSRtR01YIvgpUNlFK6rJWIx8PCZyt4t3YFmIcAeN0QssoYYs+p62ELC9u+e3azTPD3zrHadEWAVwm3/Qm7Zn5T3zdc/dH7R6/LlK2NXl0OkBkHGnA22mXRsgbThv7hmwE0pURm0NG3ZR7xtNHiGTbU3qBewRHH1+NoiCBFBtCJ7M0pAePYFtydgsMI8K4RAGLxsZWOmQHjCkwQMbP9XpW7fqj/lbQ8mBfMb5P0eONOHUsKIP26pfl5J5pwDfaJOfhuG6Ek0xhb1gmKKN/Eqs453GA5kTuc9eTlGA4NgZQl39cO7cPGDAY4UIk2oElhmM9PgtyE3oekqg4gtx6p1RgtxXRGNtGvsCI/gtXrNLlb+6vY30I4ZBByOPCbsqGQaF9sv2l/fdV7BmwE5DGGep1H8Ynf4JYKTAyuEjbCxwZbb4OWdKAzcGfk1QY3CV/PtXwJp6b1IRUGVIyU/YOLhotOceJvPY64MFwvEatPWq1CJVGfOUhSvV2SBYy9uITuf4gay3HkkNlUMQhmbuLC9xqj+iF1/+447quQ1AJ07+oYrKsdau3pujLZH3w178i2HVwVU8eGY2EYpkTgifj/yN4m4iYTIq/3Oc0JfFo0TBAmzNyBAO3yN6KkTdZ0w8khsqhiF8YOoRuvJL4+uxFJzTyDcfnkmM/Y8BKEzrpFQF44p+4MbvMKMmRGa58VaQPZXZhMsJEC4GGciQLxAQGfIAO1fr6J3Q2flTV8DcCwdc8z2uPCyDjThxVsmg6FAPnqFjTSSSPcyPoQMEIN3SwvAosEdhMp0KCosy1byxvbW+Y37zpnggeNH/vWYld5jLynBPk4TYZJ+leDTWYGLFH3f95YbwWEmVDZVCIzAPL8vw9ouWoPIFn4IYJDgl/5lnjNzYiw/I+HXfaIVPXjDS1jYBgzQXGkEDuNhhsGqya9lUlC9/XgkBpfSMrtjpA8wRFYVAf9KKzY2prsx5crAiMw80KhNhfA9SvKfAp1TOHfOyagFvvPd59J/L5mZ9mAxwZjZMxnLYDxBwhq9LJv54sw8nkjF4Sno+jEtSejlnwt3RYQLxOZ98skHvnGLPQ7sOHCrue+t/OgWTpXR7SuwpM7yangucacOmU5swtC30lSzr7W+NHMgiPscjSPJgT2/DbSCm1xH4SpXuneToMqT5SFCcvqkhwm4IELesVZIuTwj2hPrkkzomO3j2blcDuQGbljUVwVL9WdJpuIELD/UyoY/jrTkwLC+ipguwtSEYm5Wrm/v09ZfNKflo1tU5bqHcTJzTd5yDeP9arx8yS7KfbrMA7Dinw8r7fkShzGe6RQqGwXt0HdtrEg5d5XxQVYzBz9uyoYgP10BZgeK1KV5zxc4FI2i52XPAu1B7iUUjyjev6XfUjTGbTKHxPKqe+g5GJr8zvr/YV7laGEWy6yybBPHGnAoNu/n4GLkkSndw9TjKWpy5xQ1UB1oKZAsRwHw+or7JkteigffJXAirerQla0N/Jg7gGkaUjSriHQjgPNte4Nq8evO9Dq9VJcWjS6H3Xn2AFoyPtf1vFxeEde0wGBs6SPZBSobKKp2y4wYRN53EYYVr0MIAq4hQ+k9Rdz7GhdJmWs0jEY4OQLTm+lIdntMf7ns7spQqeo9PmBUpqFCB/VlAuf71AjldO6fbAvr6YvwFT3aXJeRuwQZAwtMb3QH0J6MdjKQ/meONOHU6ZVyIgrH2+5ca2Jx2HldZATkWoHixLVUZfCkRHwzxjUNtxxmU75yFo+zvjH96pm2bBEkC80tc9itbefIJOoAv78UZX1Q0pg3TdE59IuOxQuFRS/vMQWkPajer0Ihc404dSuO7OuhXXcf4KKvQ/qcQ+fm23HtP0IKHuMPylhL3SfVC6lLLoAItK2dZ1lFznUxCs7HCZTgO8SudXfQpxsnl9ay7+krrIOtJNFBSTl41kk1FAh4dVzYCS3soCCoXWzR9DPOHGnDqZTMvceVXRfidfgBQKnmPVLoXqVDAx6t26NgCyiyYiZPLcPqPh4tqnPi/yC1Wq3X5efbdWS5WEiqmaf2HM6Lkwi+DAX5AM1JeusQQUbpyzIi6K37dlQyDh/3xVlRs1DKLMPXo/IKwXO9Y1AvdTIf3uaxcsfEWdVncPi91XgF0cNq/WB7xoAiKDuH93+Usv2+zWf2+RDU9BQUH2Nnjh4nM4Vk3DRShGP1UHw6VYKnQ3jpp53h5p7HaMwTI5LqqVQyDjTgYXs+iJtfudFN3FQ9lImRE46rpv4faiffg809Yb5MNP3HsiLdwPlDK2XCYFXxnFTcXsQXHirrId38voSu1LWznQW6og0vzdzhOMsd9CWbWgnYZu15Z5uGE/vd8C2CVDqZUIldyrAu/cB4PFPBMuovSSWb79aejGaf6haqHhzNkm3CeQKmCBxWbSvwqptsg6g94J49dNY0iJ3rPvC3s/H+J1eUf3bi8OplQyDiHDQevkvBXQ/agwxIdskXl+YZBhb0BtWpQTsjhyETvNBj0UvK9l6y/551lIrpHCfaGvgxpw6mVDH8uM1VOtB0DInh9uSOUwUqaY21mgFGtGyFnzdsfLT8XMxiPWXIbKoZBxpw3hlAsT32VQ2aclUNj3eKsp40RAVIeL+HUyoZBxpw3chkgp+84d1/za2RIjC24MX+kWyDl2ok+7x2oF808cacOpkW4taZLwmJ9ExEXya4g8gs3EZ0z4Dr6VBQ94qbJFmcYZ4404dTKhiFlExqSM6OY+tgSG7fGir5/cPz5svsCHPdiL7nGnDqZUMg4hZwLeovmnvaU06ceClQzJt8lo404bYAA/v6AgAAdRtyGo1p27vKo0+xBNf++wLe99RLYK/zlCjQSsb3u0f17U++WWif4DNIW7ggZ79ER2RTpZTmVfzhB0mh7DWwfIV5D2KhTP5u8JLgSCEvRiYtEGU9HD3fLJochHjdhhgjFmRU3Vwhvcrf4bH0/s6I32NI4vrfosiyOm0eSwEetYNcFQmWlRVof6RkUQ9vQ28hVLTr8warZT5pbOJYubg/LF/IIqnnnuQfH5GqhEBJgG00Umo1atWrVq1aIAFxpmOFckoNzR0sX39n01g5luohFfu1QDG3a8TSt/s0XhKNz2U/M83zdm71NdTIG77/rQ9+jheukm4oKaSeDiqlnoO/D3o6lmPewMCoMOaq9yNyfmF1rwLL6oLsoB7ZqBWYUZQx4IW4sgdOT5xRgmqXHsfqVEjv3Q+DtVo9+/yjZF6o4Vn9yp3RpPGSATOv0JQ1r1nQQB+SyFDMfcmceMzy3rZ+a3BtJmGNoNgEmcjkY2RQDxLqFXjhmA0ilQ1mWSv+RSLinTaAXC30fkfBCXv8hQ05Sht9sJgpeoWXjmosqYadeAQODDH5eNNl6GJbc1Ws0uAAcJZ1GFNtRvusrz4RrZJDDRxYof9x5cAAABk9Pscxh9nOlTWywsqxRRl+QnvWwz9/UPCgaJ5cE5+49tI57bIg9EywVRA2l/MBdlpun5Um/4PvzHMqhGJ28jJioOJqHVsmg1lN5H88AT8YHzONWp/fyrSZ5aJ0I93XatxDCDE2PVAFDdsg/CoSU4D2z+/viOlhEfWXIV5aMrdOOCsEYj0mtiXUgqyot/hsOoSZdM1pKG3VyrXPa1dQfCld0pfD8B9XzwzSU9cFS3vWVq4tTMHYZ/7/yPHaSHiQ0htJC196cmCykVJKVWS1ywmsmpgll4ooxJsYNHIgpuQA/Ahsz1EdtvAi94NLC+sQl9+rDDkgTpT5bjfmCC+kJJLQpKqkAFxakZPz6nFNK3ozTgAAqpuqfOflckIKWVb27s9VfssKZEr5j+etAuJYjLZfMWsi8KQzeLwZ7S+jrZbmcp22nHqwsOt2g7klwFnrTuYqxbgX73wK5H2O67qMV2pyA/JW4Q15JreIXfDGH4QXbQ9D9mxFtENVnkRdOrp8lSu3vZzx1/fXFod3Hg6z5XsNYpFXFlPp0NXXvQQU0laxdo1Uf1YVGLQ5iW3hMo7ELPML8SjcCoH0Y0VDGupHe5MVoZDwrwbfvc5nLmBFiivV6esH4XwYIAAN//TfXJ8/2TaxWQnAdevwHEn4WUxa9Zb9ustDpYgJkG5SqI+4/oFOLwDDI4MtIqsGjNc6Ha1Vx5ht7Q+zRauqJ0ixCwX+tTj66KPn1huV6ic7KkccIMrC9EqUvboCsnJeXC2Aq6Edyuaf25x6k4LepeIkZGUKZwqeUXBWHbJHjguR3ZTkfnlzo6rhPcPMwLRFRJran4pd01DW4L5ZV69tbFO4rIoTaiw2zvWhgy65Bbi/he2G89xJSL1SJe1oOG9pPFAvt7qVWI6Wxs9NHcfdcZwulKy76h9nvpAU/8ImYSgSTCmAUDl9IdWF6txRQ3DWOcjK1yDv5DW0pgdCezc6qlA5k4xtEHq3AzPRAANKATHJ3kb13joKw2rwvU/DuZX+wCQIswX3eQKwfa3uuaR01Epq8Y3AYcUQ5H36w2TmWiYGvD7W7mLdwysqBv48GXSx1iHrr90HO8V5s4b4vPh3GlMU4Ld9Ilf2nO2ywY+XVyzQTdQPSPsT2+UGgqB16jdIlb8EdXt6jV4jCa1BqE4SirzuHKpqqkFqE3Uf6QSZDFFD7KoUwO//SSFPNB+2zIZNku+wz0rJlm/5lnd/eU+zsifdmrJBzg8UfVXkxhjCxJKBNB86u3nWmSnKKfKO/+yV854k0XBCUhm50sgFp+7DvBUGmSKXAqeU80trUhNpHYyP24BbHOh2cDtqRkUK2UKXqmwiIS0oAAL8MC76ESsq1u7rj4iQn6oCmvcvjL++DQlUynbVWbBhg4vNlQSyno7X6xu/n9bUNnzx/+KRtZX5ktYkwPoNhrSvtGJGtGRw37e3COTR7vnFP4nUPWO7L8jnX7oadLXGF6TWJWLYquwAnz2G7kuECnqXnwiLN5SV7csMFptud4aWnHL3q/QBnZk7yXHxmFEn4g2YD3Ga0i5iPcBSvyhOtP3FO5FCZEPTsO+RDBEwUbfyQm03F61svV5Oho7WyWpD0NH1PWctzP5lR4ubT73amO3InEzAMB1KbdHVztxDSStwkns4Wbm4FpUccfQJUllhDyWfGS1PbTn/5JeBmpDciaYHE9O4XCcQLbWLIWljmrJ4NE4cIPnefjVn4QListB2qG+TR99dpHM5GzuvL/FSXPc5oq6jEB0vGsCCYIaCC3GXeouWAADw3mbjGRjGjt6OIi8hT/FuBGhDWT8R1z3EwGhnBWJF1tOrs4iAvxOISdFttOnBbyDGTWHu6/BTdyiSAlAOKk7BROCCM+e2WD3Fa9SKaCai5W1RgiWlyMip1s/4ZwdsycTeA6Duyinp9JlmRHeeyxkPog2Xl8npKu3XubrbfVhPrgpx0laalL2jBeQATr4PaV+LnoWHQ49N0H4a9ft9TA8OlNLPTq/6KQBvJNZBDmO9TzXYWdT73BDtVCpuxlVqVz6YXXU1XAgZarSyBgAAAsd684HJVf3hwDGOVZUTcSnYoROhuu+EPAn1eyjIZFBExtlO/tPuFWmBDQKI627o4xORPOY7uzZ8GHiA/BP/23y5FPTPM3gpPEOXyeb9yZvT32FwvRswSCjcjVziCYqHee7qlUsZdbGvhsDu0S6ivH3ECSN2w4Hru5EUsGGm6/JgmrnA7yXCiw8QxY+fmOsPO6cUinWPHeePCtvkSrsB0SvEBKDRoODJBW6WbJOowsKY7yHq11KpupRnwZfcgDNJ5Il3Dsdl3PxX72GhcmUyAQewwQAAHwUgzx+LhZXAqkBBKGtNnJlb7e+ZhjSQcdA968hZWMyYSxTvKqDxd59zCjTjHFiz47KfzONVwjZRCrr605RbGbnHZmR9KZ1gYwoBbgFoYiq2/OgKTIPYnVGqsY5Wq5sOlqpBYeFLvopTH+1DG+0eczLBUJ14vnCwNslgotJNfSnFWPf0GhRCjYDtKVZuPrYYkg2N/aBt1XUOXGgMAACLCSKomINPgBAGkgANk+D4ctPKm5/FusPZiye83n4JmYhTfGIWFl3yzJlcPrN5s5rTVQHPdBlh/03pLk9TuUiBCIUL4q9K4mUWh4B85EWm9ei04Cx2lw2UmXWhG5Kz3LWKNKCSltQhjKCn+/QAi2TxxhyRcAAAOw/f2BPhgtu+ZeBwu6lf3lwDXN+aSkPG7Hu2l+Q+7OZqqbKjwvmUedNWUqnpFrmzZFkn6Wciol3ABoYhumyk4G1VzYm6TfMWKrJz5puiKN5tbDgAqSK6AACY0OGrf5Mvtiol5NnTp8RrBj42AEoxzXHw74PbeUYSMjxGFNz9HySAkkVoY538zDjYfC4ZLXhJZEmIK3VuUAg6MNcvajbeepEQDx/vEOnacr/l5fS7HmAq58CNNd5vMpsm4MItRY2JqSOlZCkTvFAVP4scWh/f1jtswV1d1CN1GO/OhkUmHAocAAABLkh73dwM8is7lyK/JLN4DKQRaS+M7pD9BD+hOFZ7oiOMo9fgi9fF4LxXnFE/3gunx+va8DADmBUtGQiZ5p9xN95RWyKYPFT7+A1r805H+Rso1ch7/eTEaZz6/Lt3EwhGZFltkbVRplRuNZeTr6wpGWQ5mzIr7JE+JP2AAAC+CL0/qSEePU0ikv2o2mffW5YguSyFBWRtr2R95recW2q1pwJ90vnakzSyUMcZFouDCavwro2OliHJS7G1rC38SzwUxuw5xw1ozCaAq+bFTgpC6t7Mb91VSZ5nE0ECaCayFQF8p+YyahPU5EzLGfWH2okg1JbpPZn/fCnPtdNcZ7YY8V8HbO2tKHLiY4AAAC3hQPBIxfPDmsm3hlAtBbylXA4xbwsxQYOKOgH3wT7GZ4lA9fwtCA5Pq+LfsiuFx8V89WdtO4eieBp1N4bgSyed/LOJwIUd7V4P+glnEbRU3xNzw04/kfKiBdZkDyMKy0wd2oIxLr8HXtPq6Lu8w/5y17NFcvMFDKmw+s7v9jI4QPbYL2YsHiiHoUsAfUdINt75OL0rwHzXXxXPSsJGaW4yirYgCtTgGHAAYNo6xMW2mBnUCmvyUNpce5An2vwH3K7zcg/eqMt6NcKpFCTEoANJIiyrKxl9HGkCCFO5cGMtVvhPP/UGQ3RudNPlDYNFjs95hYWzOhb2ThTloAAAJJbJczR4izTaRRsUlcVjjEr2RdNzGPwbJ6iGGQHRu/1NBA1DFhx0M/aCumYa5CdAAzNfJ2+YAlR7iteLR6Ohc5p59byXlc4HwMtGZlf0HHog/uXkyKX0BqsSoPMoQQjnIDf0tpSAsnL81azqv9yzwA8GzTAnFy0YCOWUGMTh5dVZKBeyOUE5Pb0lnRSkRRS8gVzdyXGKjTmloLCNgiReXgZDj4EuRtFG6WW3EpJ0ryivQD2ZAWPZ7mhPYfmyDvKaEZ3uvoaZoBHQ9ip3bTOXMZEn28s6lm/ODEa+8Q8+ael5vBlD0cLALx1IvilCR9ijyVUD/pdlB3B5O7z8QOSyyhtAW6T5liv5IKvUMODHLodz+EQrnUXvZfy8oJyAAh1uwRDksXGf9/fzoaoA42rpMcP+GpvOBcktk46hIYvA4K7otblu7U7MCEul1K1Ug272W3AvAjrmcp7Xg9q8laWvF1iYKGkk1AdO7O8QGLCgHjqROPsix7udPw4hL/y9MUfE5pEGTwWTxCQJ7lmtgsuLYpiLCI4RV/9luDA978b3PLAST1heGT5VpeGy0gmc9SoGqv906oS6hajXD4vmspvueG5nmVU3iT5bGCwTsiiVYHbkmZDPP/9n4h1Me1mNac+j5Wjy/707LCcnfGbt8qnOKmUAje9PPUHen1slkvv7iUk1apyMs22iH2hcfMsTFPcpIWZ+/r2SZzvIPDnYGaYD2tHzaIFFcqlwBicy+8N7BmDQ+vGKdTi/6Rl4SprnnAILh8mNHzAsYz9bb/l/LF8zeZCcvNLE2H2b1m7Vj8zs/ZxzWJYFcGNxKESAiTRVvD9Xyw4vz1XFnmbw1/+VMemZ/bb00XP+VIBT2y6kr0co+O0PZ6WcYmKV1+942kpJ/uXS59fah4Xvqij9p8u0tkOkNCYO+PAEuR8b3/xTwiagO94anCS+Fdrae2rlW4X5rvjiU2OSgLqRDil4N+0hWGIWXHDYbv/P4X/+gNca+YmPkz/PmQLoQP5voIuEOIADdCajvCp8KAAqX1DpMYt/SWjCux4CsgTIjyUQIG8XbfGyMgop3HMbChExM5Aq6szSaSsazPGwLQyW+zw8efIbQLRNkHzHWxC+OX8yEefbQAPppv3h898Uc4lITeqOgLzHDf/myBZhQpM4bboO5ib9BSgLRqzvBmX1GpNIs3ZIK/3GFOJ+APWKmq7yTa4J132wbfqnxSx6DS7rxw9nMUk/JU5bTWI5n7XamQNz29u0y8uucoeVRViUgm/jaAEqOnX9bul6NkRhyrNPqJgWu73Ad33Z+s1wnP13xOAmYiKQSVz8WECqcCTLgbARmJ0sorNMyyRGGtIkBDmBAZVrEXBHIO2ScT25Rtvt9ulEfOGQj26kihqpFLv7Ai2CNUeIRWLd85io/sKoTpTfpiYdDlYVYqyEAc0IOCqHjre1SheZzskwVFy9h1UBy5uMzwOw4HNWljEmv998jReG6fxqKMhN1fxUfW4s9mvLCAWrn/7EalKJJurueqqAcjQS6sHjnQ2HYTVjB6rr3Fp0PoekIXojc4fvTXOZHK4aeesl9D9dEXNBRiK67y1OxP6nBSgOmJDetjBKa45wqzRwYfBge9LdIUJplImnWcbNjPhzgj4RVtw1Xu3DbfYQvfuH7x9LFg6lmLKGXpcqZABErMmHn7gHaDA60syuHLkyc0A3R7RCmhMptbgV9EqMF0kr1hGiqEJYGUth4xvWo99lLOc2qNGGB8O+U8B87ovkPLPPSCt86w7YM1AMohLtl+RjC6bEV8AEAeKgbfQ3wr4DQANc/uNc9nIV64H0jqeXbLAQ0Mfyj+7zbowifXEYoM61ZUUBGOLAUKfzyd3hEWN5GQrh0alEtEddSWGuUx+MInIu2hEOig5t7XijBxfWhJFV49ItC3vTQs9iXf1zo4fVs4ztBgmMYXho8bRb/1tg06JiCFlU8/VVo3VJbI/rX579nR4M+EDU0dNQkrodc7Q1AXdXF1Fo7RRqsk3DOnc7T9ankgQLiYsHqZJV5DFXGUdNQS6UuOsbjZ8EWzaBg7Mb6mfnpWaC7FNPtXHKiQRonRObxosOjbNUtwsGLerGEss2jmw2g93HOPqcLA5SQIl1cTgfFpWguPnkMTJjHSiwXtIdwmuAVPhjKXMhydFoEW9KEZ/LuZvWOOCss+n5nIP2CC3BpTS4XEkuBwPXEEnaTPGOmfEiHKhdI2TMqcdfxbYzhykxcdKVXp9MAWrhEfVVD5rFJhMGvIw8mP23C8vIGpsjbvMDEC5V/ZKrcmGmiUydsYY5FHIahxEfeP/5YBLz5vJUR3JF4pwrBV2hJYjcPRjB+cgI/JKjEs1uvrCNDdttVXr16bjXRZDYVyCMb/kbHI5eCoYt2lUQEukqTnESbcWJ6l5LMKG9JZex1W4g2nuh0kn9Sj/t6ZeeVEufXI8DWynKO4qZN2dh6LBIgRfcSr3ebeKQl/2tNkrhB+QKAwKlcHClz3M0rCKxNN95n3AKeWy4GKi/MkW4OSDVXWto0ZDGEaKlyGRYjARirKRpqrH3NbnxRHWLoef9U1bfYJMj1Xqk1VgInRVPMYEAJ2JTrJIKnqAgSPZT4PNkkFdUBFGERl5Q5GEEj6jdzcc1va3pQCpF3IPuHTnKS0CxSIW2afE8ub5xomV94kYgZ33eZJT1gRihHI8Ba2TZb4qIDDhcW8dgFsWYSMDsiQJQ/DGlcoyKU1eyPntygkZvggrDduj+KgRme6yc6x62YpaHMGsjGM7fPvH+U5g+a373ytk+ZekF0q+uv+0xnz/7PfneVWjrgG37doCBNAvHugQHtLw/y87JfEAOr6edmIfq0jnyExBqyT5eQJ4IiLWDRBKrumpPxCDIfVNc76MKEOJ3kPSGg7FdlrUAMxPCM5qq+Uiyzx5KB76mt30ScfsxmDsf1pcqynL31+8b9GFZzyGvgd3TcbfCYP6cPJ9buLO7Cgyhnt758PS5Kx6Jhppn4cbK5xr8THgFfO52owSU0d+ubiu06KTKJgiEo36+xzntdPTWdqkRnLuSmMl4uTC0brm7Rxv9ry9Fmv1uiNW9FLNDmHN8BrRMueLTq06wQ2w8Nnr4jM9DOLb1dM3JVWcEhnvMYrleaGr13umwdwsUqwRjRu9qGdZJrHFRCUn1M5NFiXGU2mH2tqlWJPgxgMdvjKJlMletZgNKW9hhyaWHGgGK/MO6C7q8v2lXuZfg4s38e2nBRU9Rw1RUjDND3l7MS2vk1UOXkkYKbky/5hpaocl9m9iDG+mQDJL1kxmczxTwjO2cNdP/fYW9+h5XlwbYNYrjDQVrOswAKtcoNxPTtdv1ljDAHU8zGvOG2Lu74i2JVzY0aXaotUi242IfK5uAwrLqf5qBMpZxwMQ2SjVQ55LICgyEcCBLzVePA/0rIE1y4/s3K4Jwd1NtzKUaqujXdimu97XfnpEnSkfd4xolB1MD7x7gHGWzK8hGsFI96KZYp0RtjKiTLMGhPSAwM7B3T1df/cV/Jqj3WpMbGtriXo58RGdRIJGqmn43NEwm+r7XZA2mENpgOVmvVaMDembm3jb1Kup6tngu39tpUIFIqk51tZk8wZiZZKkWwQ6FAD+qVSRfEKAG/vhSrXmr+Dgs/PMwFEQqwjRzVd8aNFk4ewzUQGzVkRdyfG9WEAkc1Qvnoy5B58umXXnSouQsCgNTVzoOAMo/koOeYgcvDy0HTOHeoYeo5tKD1vKPn6jCfzStkZV0HdJW7zGHyVqN1rmGoOP9cALIQ+i1FcjDiU54F1a9AA1bmpXKhZoPrdgdiA4T7eqy6uJI8Y+Xa+hTGAn068x207Ei2ZeaBnSwgIr0Yk0XvDFZMyBgpR64mxbWlIlkv5nIqNut/Gb0IOaXOIYalFhaX7b0AKxOwVGAlUr+U8g9HGUZS16WOI13UKLb2FwOnm2Xa25dsB/7bPsNRdwZxOBF3aByd3E1dhrBAKnEF1LZPgrMbJnNkQSCOeLzenr6FK54fxbVo8xroe1FtD768SyRFQ1DhUSR3BxiPfr4boMXSIRTAK4uc62qsckAPyoobqf3dOfEJ1EdvbIdM+FLvCT+rjbeN3SePaYF4SXovCBGzyv1PqSXaucTk7ESw9VUrsUZzkwZ+Nn93EkXh4CpiT4AqYQv6ginoiUHwJHbi6vhBe8w2nIfHM/hVF3HBMJBO0nyj8ScvNnbhf+2wDci7TXEFp/BvmMzhE45hokmQ2Emm4ECVtyv+C4peSYFanedPATJJPj1878aRbZ6TXbW3S/SxbbvT+jH0xG/PhewV/21XUlJZMvvICZszb+ZNvegDWk4DjrQiEM6RWzuqeZ9lhHAcB+N8ij/p9jOff3y1rbQP98vVFnAUPZlB0IwZAJGgniM3E8dby2+9G2uSy0UxpwNNuLBZ9H8+xssWQAcGU1cx+6hJ+3ruk5ueUxFSEChPM4BK9LGncojgmNpPpvwd9XOWB9HuKWAQwdwJ2VLnUW3Xjsn1kfQMzE4qKvs0aeLub6r8KVj3T4JGk6gDIY+QRWH9RXeItTv54UE1jpvJhvooSDecK4y1W1QTADK6lPDIBirrOPwc993ig3wZnN8ZtdfSPzGg+9500RMEGkOxVoBVaDLAoNRXPpvr/vEwE25rFRIbHI/IAeDy1XOqzlUGKM4DmesCHZj1UlOcQI3k9m7ieRROuo3I8p929sx3qMS7lHpcvLsCY1MYbkDIYsIIeJfZjZA2aozH/GeiMgl5eTmBGqH9UxtPdh8IJe2F7KNq5+wt2o/P2wa36b28BpXKvwiJPzDqrmOt11mvaB3X8UCL+UWlRLtGNnxavaprM6itlPi5omcstPxdb1Heuz9ah1lilJ1CMobwhLErRhcSwSqCb1zkusqkVjiZ1kEuEEUcCU9bon200WNFXzbZgaDnaZXEg2y1Wev58Xq0SQ6NoeeSgZsP/n2OcM2svOTTHV/e5jWZTRhFeNGpuL5wIvq1bvKniGokgPZTYMmV66wNZJhLdenxVE6V/9AsUzftKGtPuD+2fKGmrShxZJlpMSUKF4RqeNsgVxdn0CK1gW1qtlABUZt/H0GvflLtwBc3vxt1auBrhaZog9eyQQchDImyFQ56lHZRNPbvpk9gUcNsT+cmQUxKYaxguIQf/VSX2jt4CxbZ+iSWkz1BmFewIkvUPhA/NZ45pEJH4xaDdq7OpB8BZKpxAQ9mk8+Y46OcF6b5P1LO8jqXqUooHw7EoT2j8DSW1ZjbFTx8GVJw51KeNgh5ebqPs5Tut9E/bzJ2pZrkjKdl6OO773N5Ofnz13gd685hIt019kjDiVewA+sv9AtDXCdstvoO8Ar4Cc0F0z35ZNt7vwd+00/CyVrdbRN51lbDdUbpsbp3eyxAqeZrWw3IQXgvIcTrtTSFN8tMCdquyZAHqOcd/XV28Pfozu9NEQ9Csrk/7ARxkMCQg31d3I5sg5Xq4QYPxjRj7WuVooYY9MBMoEQzxo1DSqGDi9Ivb63YHT0uL1WCHBfQzXCdAqw15pcgFPGzq6mzAAQ4es4XTEUbJHTiKqpHP8DUfR1Jjk2LJkQ6u2KenK1rTZMXto933Uoilrh1p3Uti/PAKE8aLnR3xfN+nOpo2+nT+WYTBUjyGgDT/2EJ+6988HcTiQKTU1ZLSTlawlIC8PYO9Ym8uSe0PGqXmC+qcn62S24+3Wnq0u+q1eJ6Xcb22ciPBwJmAltLMGbOLjJUX33HpTpm7L0YeQw+NWERX/j9WVWfdiqkQagBe7UCzsxwzMiFmfFuoIjLJDDwz1lFUlwC+hM83ztIdduU9sywhpwGxS7eqGVx+2opYL6o8kxghoDwGz2Nr6qoLmKgIi0VJ18PFPXn++vmn2Av1OpcMPWEzyXzKeKLyfDSLlkNorTVI10RUqC0xEvY0h/sOdE17WDgfGiE8mJCkFsl5TF+TFlNZ2sCRnMAa5PE9r1DaC9Jp5NrJnya94SDqoihg1G5vQpM/y7QzG2WRgS5V7TuCzBruOANO/CNEEEMkEONVDiNzAEy+/Z6lWLUsa2Bp9zA657QyLjBSLFRv1rdIJqE3zrQPzLw2v1Z6yIFHYwFj6lPeqWAz0iT16fFLhXM20wCrIY7E5gG1ARC3pysNNsd9GoEwXPuzT2rSKxM9uMbOEWtZeU8V0v1gwy/dGWVsk3wqzbUIAuTBykxzRRhqCxPHngEjwkC7csTo/XYFA9jY0MgMVfm+ElYfj1cn5IG47c07o3MLp9qKyRG18kZ+nfuqgI1hyLsbbh5eKmKFPua30/Cz/dEPTLxkHVWNY4ofwbhcqwKHZXri2VuQEs2KwC/RKfXuWLknf0PIhdArwDyCJLUQ/mSMeVkItpeXhLOfEFW6Qf5nDaXh8s9VrsftIn0i5RlKO8MCPklVYFBzqIEZwOlGsYpH/CGqZPEBGAQhIukct4Odx+29S3nb2MNuHyrSG3giNnpZPDumGLG/pfx/+xTLksdXoHOQSrtAKnjnR0jZQlk85zr4G6XAQ2EWyv2PSuVYbfEHzQ642mR4xNym3OSAWYoZuVej726/kwrguO409AQinhsu6Pu3WAWTzmxmz3pM4NWdbXmO1TZ5jzYWLPUU1I6StrcmJNFFc9QRyP5ivxJ5AGzaDxSGzxqr7K6GumbZGrGj3n4EsilGj8TKC+VTsl/VMqCWO19GhsJQqakMQ9m/QBh8wKYdc7R+ca17cFovc9p4WL1T17FSrGcYedvwFxo7dpnD+DoymVlNBT93Q0BsSgxGZHCI/ZmlSozGieZu4V0zcnlcsdDgjKCc7+Pq3Oon23R0xPWq8rqaylwqlivD2TNRPpQI7STsdWAxByy26753JmZifM8A0rQPwYFOse6vC9w2bOLW8V95961i/pg1zRM4QQsCXrc/Qbfv4H3E+aJK342HwKp7Z7Ni1chkIhmmNvtCL7RxhjVNE2Y98UjYrlV1iyK226kurzKQWruzR4b8LvAqQ+HlYgfJnI+ditjVx3LRwsEZFfz+ua8md2mmT1EAGwNpN8DMyJwsFW9MiRRoQuC976M9zdjK6KJLjAKw3l6aHzbYLvirgRpTZ+CZDhpXY8y/6fAJHhUXnhBZcuwm7YXh0KoSXYusVBlJvWVgZ9e+v/ZB0TLJzBqpp7obSzQq8TezYV6AnMdclFrywNFV/v2RxJIeN9XX0WdpmvT6EyWCbTey9UsoZONmUl2N8OJ9t7yELly+vqbbkrlEtf8l9o/ypoyDt1P1t7UGA7dRSh/YhEjcsjeJCPK6ds3q0qfbk8ykCHtWk1ade+XaB8liWD1YNvjUoWdKAHnysME3l99rrVFVuxqW1ZOdkdUPLNf7idjsUySCOLgZsYowqba4f5wCb0+AlOEsKEoNt/VNpEwit097C7y0AtAxgtbytsVFNBFCo+AWTesEE87ezo/8QkfAE/O+j0Y9YPLmtNUwocOwC1OqRkuKyYTbfjBwXcfiGouEItyI7sN4Ejjv5oANQEPDjOHGsDVG2NprJhWUov2P2nw2svsrA+nqvmdyJXxCfksi6lisPYLYorLjFHkg06R/YSiaydtE6IoMWTaiFwM67hAWNQBVZPElTSuEnvrHXpFNdOp1ITxUt/+I3UI/EhHTZ/Q1075v/9yovDKzRLjjG2dC7ETtWvPbrKPz+9sbumb+KITxJollv0B72cgckgOCQj5iVDJ8UvLd2Pj8twanmgKoBcIgAxU1dNTxX1OpHQkOTip3ua0MlnBi1ybqRYVTtzBljllGuh06AOISZKLFSIPSwGxhAEAAlrD2KcHTo9FPmA9BSAi7Ky/RxICueO+4jr9XNKn85kPTZYJNyGD3jbNoUD4pAzS09yFtaQnFvSdKqp4m9Ezxk6tbBpkXPcLvpNUfipvDphJlG+Wgdpw7agcEPm8EI9TWKjIsF1bl9Bl4oBJAFz4XxshLoIntGfnbYGQ6fNgmLKYGjsaP/p6VGVbAyRbt6fzlu0Luj4TpSIWn5VT14MJq+iMcu0OW5/nj/SAFBnjCq2BAkCAzVjXgtdTBVvYZDunm0GVfvAK8RaxI32rnRXJZfglbhQVroX1IrO2lVn0yck9ClTw6he2iLDaHT84pGVF9v/qGMhXkZbWq1no3ubFSVwaEhd6kG2hTWndk8JZ+HVvVrABKNv/awE1HXU//ahHvL4DSrH4fbFkKjBnWAuQRQdfxyu2QbAMX6rZgMzAHHzC5+ixsJUzKeQrhLt2/4+tDhAIj9d1HTAHOItqVV/mAfUEohb9vV8LpOmhtKE51aqWYhzn9ZjvaXMJ4q64ixlywhb8IK58jPbxw6A2XxTyZ8fkfv0u7WRoo+zoP0Pj76+2T9GbVU040sOAwwdDqnxw9gTBlRxmZyGsmDTj7tcSkHP0tfn8fo8pDhTexI3DrEu8IgWZf7slhMR7Vmz8YkhtwF1LfAizw+fjxzfxV0QkJ0uzvYkP/IFG4II0dOOcKRswXwB1ePftaafj3KNWJ0dssjWVbkdA0z1S92kOAxBHAzrCA5fZFL9uuLWTtStFbut05o3J9ihgBg6mvClt/nEfwXlhddxa+lM1f1ByfavavjHB3Cz5T2W9yjMZRnxb0wiAflzxtBpaEktDE721ssGOj8YNtIXmW3fZbNvnf/EuEbzXPx3WzEfwLIlQ3pKAfRzq1gvRsXTVkyXcc5A79/o0UYiANkB00X3ZZvkEjHb7JTVhfW/2uHjQZCsSFfYPsD6/aXSlLKsm8Q+1MSyrQDA+asuPgz7gE+QUTztFPLgmHHrcnakBw4dwVU/P0VNprnB3V8/Bf/i96NzQzBSPcM+3dGhcO00BdL2Y8J+0K7QhhfQIApd2Ac7XDDTb8BIo9qAjGbU4jD2sAGnzRMfNe7fX9FRo9xZxUluB7KAdDHnidlRVM7fwNxSG67kgFfdXNfaKLluIwNN3h+zDKVva7mRZ6f3NKXsmb3yJOXAbKeogAUgXVIEcffoIDLGFxMEZBMuulBkfZ4VwzDafVnQ9Ig2q3A2pWN0fcIiRbGQMilUQkLjWSE+VPE1+LJFe7+81+IsdTRuxGHRRb5lQYqw6l0XD1gAA/yTc82dx4Gm0pscNA5rF6bLK26lObOWvh/L+iiI2eapZCQ7xiTmPS3yrUnGcNnKjh6zqXOykZo1KAb+0Efv9eFLpbw+vyQo6TGT4pNQNhzbnwyfH2GFUjaF11u4+rFbqQ/YsP6wfN/iMIxx+xQAhX0nLp+8a7VH2l3W5y5z790rb0rnXtsNQWXcoIaGheQIm0cr+vpX9yFYqKkSTsRFoAHAoAAA==";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

type Locale = "en" | "ar";
type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  imageAlt: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Core Compression Tee",
    category: "Compression",
    price: 749,
    badge: "BESTSELLER",
    image: ZERO_MODEL_IMAGE,
    imageAlt: "Men’s black fitted performance T-shirt",
  },
  {
    id: 2,
    name: "Essential Training Tee",
    category: "T-Shirts",
    price: 599,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
    imageAlt: "Men’s minimal white everyday T-shirt",
  },
  {
    id: 3,
    name: "Performance Long Sleeve",
    category: "Compression",
    price: 899,
    badge: "NEW DROP",
    image: ZERO_MODEL_IMAGE,
    imageAlt: "Men’s minimal long-sleeve performance top",
  },
  {
    id: 4,
    name: "Everyday Oversized Tee",
    category: "T-Shirts",
    price: 649,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90",
    imageAlt: "Men’s neutral oversized streetwear T-shirt",
  },
];

const copy = {
  en: {
    announcement: "ZERO MENSWEAR — EVERYDAY ESSENTIALS, REDEFINED",
    shop: "Shop",
    compression: "Compression",
    tees: "T-Shirts",
    ourStandard: "Our Standard",
    search: "Search",
    bag: "Bag",
    heroEyebrow: "ZERO MENSWEAR · DESIGNED FOR EVERY DAY",
    heroTitleA: "DISCIPLINE",
    heroTitleB: "IN EVERY",
    heroTitleC: "DETAIL.",
    heroDescription: "Considered essentials. Timeless silhouettes. Made to move naturally between every part of your day.",
    shopCollection: "SHOP THE COLLECTION",
    categoriesEyebrow: "THE MEN’S WARDROBE",
    categoriesTitle: "Built for his everyday.",
    categoriesDescription: "Two essentials to start with: clean everyday T-shirts and close-fit ZERO compression built for movement.",
    categoryTee: "T-SHIRTS",
    categoryCompression: "COMPRESSION",
    categoryHoodie: "HOODIES",
    categoryPants: "PANTS",
    categoryAccessories: "MEN’S ACCESSORIES",
    categoryExplore: "EXPLORE",
    bestsellerEyebrow: "THE ZERO EDIT",
    explore: "EXPLORE THE DROP",
    collectionEyebrow: "THE STARTING LINE",
    collectionTitle: "Menswear. No excess.",
    collectionDescription: "Versatile menswear essentials. Refined fits. Pieces that work with your style, wherever the day takes you.",
    all: "All products",
    add: "Add to bag",
    added: "Added",
    egp: "EGP",
    viewAll: "VIEW ALL PRODUCTS",
    manifestoEyebrow: "LESS, BUT BETTER.",
    manifestoTitle: "His style. His standard.",
    manifestoBody: "ZERO is menswear built around thoughtful design, versatile essentials, and lasting comfort. A considered wardrobe for the way you live now—and whatever comes next.",
    manifestoCta: "OUR STANDARD",
    footerLine: "Considered menswear. Your everyday standard.",
    quickLinks: "QUICK LINKS",
    support: "SUPPORT",
    shipping: "Shipping & delivery",
    returns: "Exchange & returns",
    contact: "Contact",
    newsletter: "THE ZERO LIST",
    newsletterText: "Drop updates. No noise.",
    emailPlaceholder: "Your email address",
    join: "JOIN",
    rights: "© 2026 ZERO CLOTHING. ALL RIGHTS RESERVED.",
    cartTitle: "Your bag",
    emptyBag: "Your bag is empty.",
    subtotal: "Subtotal",
    checkoutNote: "Cash on Delivery available at checkout.",
    continue: "CONTINUE SHOPPING",
    language: "العربية",
    searchPlaceholder: "Search products…",
    noResults: "No products found.",
  },
  ar: {
    announcement: "ZERO للملابس الرجالي — أساسيات يومك بمعايير مختلفة",
    shop: "تسوّق",
    compression: "كومبريشن",
    tees: "تيشيرتات",
    ourStandard: "معاييرنا",
    search: "بحث",
    bag: "السلة",
    heroEyebrow: "ZERO للملابس الرجالي · مصممة لكل يوم",
    heroTitleA: "التفاصيل",
    heroTitleB: "تصنع",
    heroTitleC: "الفرق.",
    heroDescription: "قطع أساسية بتصميم مدروس وقصّات مريحة، تناسب يومك وتكمل معاك في كل وقت.",
    shopCollection: "تسوّق المجموعة",
    categoriesEyebrow: "دولابك، بمعايير ZERO",
    categoriesTitle: "ستايل رجالي لكل يوم.",
    categoriesDescription: "هنبدأ بفئتين أساسيتين: تيشيرتات يومية بتصميم نظيف، وكومبريشن ZERO بقَصّة مظبوطة للحركة.",
    categoryTee: "تيشيرتات",
    categoryCompression: "كومبريشن",
    categoryHoodie: "هوديز",
    categoryPants: "بناطيل",
    categoryAccessories: "إكسسوارات رجالي",
    categoryExplore: "اكتشف",
    bestsellerEyebrow: "اختيارات ZERO",
    explore: "اكتشف المجموعة",
    collectionEyebrow: "خط البداية",
    collectionTitle: "ملابس رجالي من غير تكلف.",
    collectionDescription: "قطع رجالي أساسية بتفاصيل متقنة وقصّات متعددة الاستخدام، تناسب أسلوبك في أي وقت.",
    all: "كل المنتجات",
    add: "أضف للسلة",
    added: "اتضاف",
    egp: "جنيه",
    viewAll: "عرض كل المنتجات",
    manifestoEyebrow: "الأقل، لكن الأفضل.",
    manifestoTitle: "ستايلك. معاييرك.",
    manifestoBody: "ZERO للملابس الرجالي، مبنية على التصميم المدروس والقطع الأساسية متعددة الاستخدام والراحة اللي تكمل معاك. دولاب يناسب حياتك دلوقتي وكل اللي جاي.",
    manifestoCta: "معاييرنا",
    footerLine: "ملابس رجالي بتفاصيل مدروسة. معاييرك اليومية.",
    quickLinks: "روابط سريعة",
    support: "المساعدة",
    shipping: "الشحن والتوصيل",
    returns: "الاستبدال والاسترجاع",
    contact: "تواصل معنا",
    newsletter: "قائمة ZERO",
    newsletterText: "آخر الإصدارات، من غير دوشة.",
    emailPlaceholder: "بريدك الإلكتروني",
    join: "اشترك",
    rights: "© 2026 ZERO CLOTHING. جميع الحقوق محفوظة.",
    cartTitle: "سلة مشترياتك",
    emptyBag: "السلة لسه فاضية.",
    subtotal: "الإجمالي الفرعي",
    checkoutNote: "الدفع عند الاستلام متاح عند إتمام الطلب.",
    continue: "كمّل تسوّق",
    language: "English",
    searchPlaceholder: "ابحث عن منتج…",
    noResults: "مفيش منتجات مطابقة.",
  },
};

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);

  const t = copy[locale];
  const isArabic = locale === "ar";
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = products.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatches = activeCategory === "All" || product.category === activeCategory;
      const searchMatches = !normalizedQuery || product.name.toLowerCase().includes(normalizedQuery) || product.category.toLowerCase().includes(normalizedQuery);
      return categoryMatches && searchMatches;
    });
  }, [activeCategory, query]);

  function addToCart(productId: number) {
    setCart((current) => ({ ...current, [productId]: (current[productId] || 0) + 1 }));
    setAddedProduct(productId);
    window.setTimeout(() => setAddedProduct((current) => current === productId ? null : current), 1200);
  }

  function updateQuantity(productId: number, change: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] || 0) + change;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[productId];
      else next[productId] = nextQuantity;
      return next;
    });
  }

  return (
    <main className={isArabic ? "site-shell rtl" : "site-shell"} dir={isArabic ? "rtl" : "ltr"}>
      <div className="announcement-bar">
        <span>{t.announcement}</span>
      </div>

      <header className="site-header">
        <button className="icon-button mobile-menu-trigger" aria-label="Open menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a className="brand-lockup" href="#" aria-label="ZERO CLOTHING home">
          <img className="brand-logo-image" src="https://raw.githubusercontent.com/ziadelkady20-blip/ZERO/main/IMG_0832.PNG" alt="ZERO CLOTHING official logo" />
        </a>

        <nav className={mobileMenuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="/shop" onClick={() => setMobileMenuOpen(false)}>{t.shop}</a>
          <a href="#collection" onClick={() => { setActiveCategory("Compression"); setMobileMenuOpen(false); }}>{t.compression}</a>
          <a href="#collection" onClick={() => { setActiveCategory("T-Shirts"); setMobileMenuOpen(false); }}>{t.tees}</a>
          <a href="#standard" onClick={() => setMobileMenuOpen(false)}>{t.ourStandard}</a>
        </nav>

        <div className="header-actions">
          <button className="text-action language-toggle" onClick={() => setLocale(isArabic ? "en" : "ar")} aria-label="Switch language">
            {t.language}
          </button>
          <button className="icon-button" aria-label={t.search} onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={19} strokeWidth={1.7} />
          </button>
          <button className="bag-button" aria-label={t.bag} onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} strokeWidth={1.7} />
            <span>{t.bag}</span>
            <span className="bag-count">{cartCount}</span>
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-panel">
          <Search size={18} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          {query && <button className="icon-button small" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button>}
          <button className="icon-button small" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={18} /></button>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-image" role="img" aria-label="Minimal monochrome clothing editorial" />
        <div className="hero-shade" />
        <div className="hero-floating-products">
          <div className="hero-model-frame"><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" /></div>
          <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
          <div className="hero-product-caption"><span>ZERO / 001</span><span>MEN’S EVERYDAY TEE</span></div>
        </div>
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-line" />{t.heroEyebrow}</p>
          <h1>{t.heroTitleA}<br /><span>{t.heroTitleB}</span> <em>{t.heroTitleC}</em></h1>
          <p className="hero-description">{t.heroDescription}</p>
          <a className="button button-light" href="/shop">
            {t.shopCollection}<ArrowRight size={17} />
          </a>
          <div className="hero-index"><span>01</span><span className="index-rule" /><span>04</span></div>
        </div>
        <div className="hero-vertical-note">ZERO / EVERYDAY COLLECTION</div>
        <div className="hero-bottom-note"><span>MADE FOR EVERYDAY</span><ArrowDownRight size={18} /></div>
      </section>

      <section className="ticker" aria-label="Brand statement">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index}>MADE FOR EVERY DAY <b>✳</b> DETAILS MATTER <b>✳</b> ZERO COMPROMISE <b>✳</b></span>
          ))}
        </div>
      </section>

      <section className="category-section section-pad" aria-labelledby="category-title">
        <div className="category-heading">
          <div><p className="eyebrow dark-eyebrow"><span className="eyebrow-line" />{t.categoriesEyebrow}</p><h2 id="category-title">{t.categoriesTitle}</h2><p>{t.categoriesDescription}</p></div>
          <span className="category-count">01 — 02</span>
        </div>
        <div className="category-grid">
          <a href="#collection" className="category-card category-card-tee" onClick={() => setActiveCategory("T-Shirts")}><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=90" alt="Male model wearing a clean everyday T-shirt" /><span className="category-index">01 / EVERYDAY ESSENTIALS</span><span className="category-title">{t.categoryTee}</span><span className="category-arrow"><ArrowDownRight size={18}/></span></a>
          <a href="#collection" className="category-card category-card-compression" onClick={() => setActiveCategory("Compression")}><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" /><span className="category-index">02 / PERFORMANCE FIT</span><span className="category-title">{t.categoryCompression}</span><span className="category-arrow"><ArrowDownRight size={18}/></span></a>
        </div>   </section>

      <section className="collection-section section-pad" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark-eyebrow"><span className="eyebrow-line" />{t.bestsellerEyebrow} · {t.collectionEyebrow}</p>
            <h2>{t.collectionTitle}</h2>
            <p className="section-description">{t.collectionDescription}</p>
          </div>
          <a className="underlined-link desktop-view-all" href="/shop">{t.viewAll}<ArrowRight size={16} /></a>
        </div>

        <div className="collection-toolbar">
          <div className="filter-list" aria-label="Filter products">
            {[
              { value: "All", label: t.all },
              { value: "Compression", label: t.compression },
              { value: "T-Shirts", label: t.tees },
            ].map((filter) => (
              <button key={filter.value} className={activeCategory === filter.value ? "filter-chip active" : "filter-chip"} onClick={() => setActiveCategory(filter.value)}>
                {filter.label}
              </button>
            ))}
          </div>
          <span className="product-count">{String(filteredProducts.length).padStart(2, "0")} PRODUCTS</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <img src={product.image} alt={product.imageAlt} className="product-image" loading={index > 1 ? "lazy" : "eager"} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <button className="wishlist-button" aria-label={"Save " + product.name}><Heart size={18} strokeWidth={1.6} /></button>
                  <button className="quick-add" onClick={() => addToCart(product.id)}>
                    {addedProduct === product.id ? <><Check size={16} />{t.added}</> : <>{t.add}<ArrowRight size={15} /></>}
                  </button>
                </div>
                <div className="product-info">
                  <div>
                    <p className="product-category">{isArabic ? (product.category === "Compression" ? "كومبريشن" : "تيشيرتات") : product.category}</p>
                    <h3>{isArabic ? ({
                      1: "تيشيرت كومبريشن كور",
                      2: "تيشيرت التدريب الأساسي",
                      3: "تيشيرت أداء بأكمام طويلة",
                      4: "تيشيرت أوفر سايز يومي",
                    } as Record<number, string>)[product.id] : product.name}</h3>
                  </div>
                  <p className="product-price">{product.price.toLocaleString(isArabic ? "ar-EG" : "en-EG")} <span>{t.egp}</span></p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results">{t.noResults}</div>
        )}
        <a className="underlined-link mobile-view-all" href="/shop">{t.viewAll}<ArrowRight size={16} /></a>
      </section>

      <section className="manifesto-section" id="standard">
        <div className="manifesto-image"><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" loading="lazy" /></div>
        <div className="manifesto-content">
          <p className="eyebrow"><span className="eyebrow-line" />{t.manifestoEyebrow}</p>
          <h2>{t.manifestoTitle}</h2>
          <p>{t.manifestoBody}</p>
          <a href="#collection" className="button button-outline">{t.manifestoCta}<ArrowRight size={17} /></a>
          <span className="manifesto-mark">Z.</span>
        </div>
      </section>

      <section className="editorial-strip">
        <div className="editorial-image"><img src={ZERO_MODEL_IMAGE} alt="Male model wearing a white ZERO compression shirt" loading="lazy" /></div>
        <div className="editorial-copy"><p className="eyebrow"><span className="eyebrow-line" />THE ZERO POINT OF VIEW</p><h2>MORE THAN<br/><span>CLOTHING.</span></h2><p>Good design doesn’t ask for attention. It earns a second look. Clean silhouettes, thoughtful details, and essentials that belong to you.</p><a href="#standard" className="button button-outline">DISCOVER OUR STANDARD <ArrowRight size={16}/></a><span className="editorial-watermark">Z.</span></div>
      </section>

      <section className="benefits-row">
        <div><span className="benefit-number">01</span><div><strong>DESIGNED TO MOVE</strong><p>Comfort for every day.</p></div></div>
        <div><span className="benefit-number">02</span><div><strong>LESS, BUT BETTER</strong><p>Essentials without the noise.</p></div></div>
        <div><span className="benefit-number">03</span><div><strong>MADE TO LAST</strong><p>Essentials you reach for.</p></div></div>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand-lockup footer-lockup" href="#">
              <img className="brand-logo-image" src="https://raw.githubusercontent.com/ziadelkady20-blip/ZERO/main/IMG_0832.PNG" alt="ZERO CLOTHING official logo" />
            </a>
            <p>{t.footerLine}</p>
          </div>
          <div className="footer-links"><h3>{t.quickLinks}</h3><a href="#collection">{t.shop}</a><a href="#standard">{t.ourStandard}</a><a href="#collection">{t.compression}</a><a href="#collection">{t.tees}</a></div>
          <div className="footer-links"><h3>{t.support}</h3><a href="/track-order">{isArabic ? "تتبع طلبك" : "Track your order"}</a><a href="#shipping">{t.shipping}</a><a href="#returns">{t.returns}</a><a href="mailto:hello@zeroclothing.example">{t.contact}</a></div>
          <div className="footer-newsletter"><h3>{t.newsletter}</h3><p>{t.newsletterText}</p><form onSubmit={(event) => event.preventDefault()} className="newsletter-form"><input type="email" placeholder={t.emailPlaceholder} aria-label={t.emailPlaceholder} /><button type="submit">{t.join}<ArrowRight size={15} /></button></form></div>
        </div>
        <div className="footer-bottom"><span>{t.rights}</span><span>CAIRO, EGYPT · ZERO STANDARD</span></div>
      </footer>

      {cartOpen && (
        <div className="overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="cart-drawer" aria-label={t.cartTitle}>
            <div className="drawer-header"><h2>{t.cartTitle}<span> ({cartCount})</span></h2><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button></div>
            {cartCount === 0 ? (
              <div className="empty-cart"><ShoppingBag size={30} strokeWidth={1.2} /><p>{t.emptyBag}</p><button className="button button-dark" onClick={() => setCartOpen(false)}>{t.continue}</button></div>
            ) : (
              <>
                <div className="cart-items">
                  {products.filter((product) => cart[product.id]).map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt={product.imageAlt} />
                      <div className="cart-item-details"><h3>{product.name}</h3><p>{product.price.toLocaleString(isArabic ? "ar-EG" : "en-EG")} {t.egp}</p><div className="quantity-control"><button onClick={() => updateQuantity(product.id, -1)} aria-label="Decrease quantity">−</button><span>{cart[product.id]}</span><button onClick={() => updateQuantity(product.id, 1)} aria-label="Increase quantity">+</button></div></div>
                      <button className="remove-item" onClick={() => setCart((current) => { const next = { ...current }; delete next[product.id]; return next; })} aria-label="Remove item"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary"><div><span>{t.subtotal}</span><strong>{subtotal.toLocaleString(isArabic ? "ar-EG" : "en-EG")} {t.egp}</strong></div><p>{t.checkoutNote}</p><button className="button button-dark checkout-disabled" disabled>CHECKOUT — COMING NEXT</button></div>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
